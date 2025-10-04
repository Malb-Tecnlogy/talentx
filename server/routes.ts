// Server routes using blueprint:javascript_auth_all_persistance
import type { Express } from "express";
import { createServer, type Server } from "http";
import { Resend } from "resend";
import { setupAuth } from "./auth";
import { 
  getGoogleOAuthURL, 
  exchangeGoogleCode, 
  getGoogleUserInfo, 
  getAppleOAuthURL, 
  exchangeAppleCode,
  validateAppleIdToken, 
  extractAppleUserInfo, 
  createOrLinkOAuthUser, 
  generateSecureState, 
  generateSecureNonce, 
  storeOAuthState, 
  validateOAuthState, 
  validateOAuthNonce, 
  getDashboardRedirect 
} from "./replitAuth";
import { storage } from "./storage";
import { db } from "./db";
import { 
  jobs, 
  companies, 
  professionals, 
  applications, 
  contracts, 
  notifications,
  contactFormSchema,
  type InsertJob,
  type InsertCompany,
  type InsertProfessional,
  type InsertApplication,
  type InsertContract,
  type InsertNotification,
  type ContactForm
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import OpenAI from "openai";
import { ObjectStorageService } from "./objectStorage";
import { Readable } from "stream";
import AdmZip from "adm-zip";
import { 
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  ExtractPDFParams,
  ExtractElementType,
  ExtractPDFJob,
  ExtractPDFResult
} from "@adobe/pdfservices-node-sdk";

// Configure multer for in-memory file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize OpenAI client
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function registerRoutes(app: Express): Server {
  // Setup authentication routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // OAuth routes for Google authentication
  app.get('/api/auth/google', async (req, res) => {
    try {
      console.log('[OAuth] Google OAuth initiation started');
      console.log('[OAuth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
      console.log('[OAuth] GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
      
      const state = generateSecureState();
      storeOAuthState(req.session, state);
      
      // Save session explicitly before redirect (critical for OAuth flow)
      req.session.save(async (err) => {
        if (err) {
          console.error('[Google OAuth Init] Session save error:', err);
          return res.redirect('/auth?error=session_failed');
        }
        
        try {
          const authUrl = await getGoogleOAuthURL(state);
          console.log('[OAuth] Generated Google auth URL:', authUrl);
          console.log('[OAuth] Redirecting to Google OAuth...');
          res.redirect(authUrl);
        } catch (error) {
          console.error('Google OAuth URL generation error:', error);
          res.redirect('/auth?error=oauth_failed');
        }
      });
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state as string)) {
        return res.redirect('/auth?error=invalid_state');
      }
      
      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code as string);
      const userInfo = await getGoogleUserInfo(tokens.access_token);
      
      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser('google', {
        providerUserId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImageUrl: userInfo.picture
      });
      
      // Login user with Passport
      req.login(user, (err) => {
        if (err) {
          console.error('Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        // Redirect to appropriate dashboard
        const redirectUrl = getDashboardRedirect(user, isNewUser);
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  // OAuth routes for Apple authentication (alugae strategy: code flow)
  app.get('/api/auth/apple', async (req, res) => {
    try {
      const state = generateSecureState();
      storeOAuthState(req.session, state);
      
      console.log('[Apple OAuth Init] Storing state in session:', {
        sessionID: req.sessionID,
        state: state.substring(0, 10) + '...'
      });
      
      // Save session explicitly before redirect (critical for OAuth flow)
      req.session.save((err) => {
        if (err) {
          console.error('[Apple OAuth Init] Session save error:', err);
          return res.redirect('/auth?error=session_failed');
        }
        
        console.log('[Apple OAuth Init] Session saved, redirecting to Apple');
        getAppleOAuthURL(state).then(authUrl => {
          res.redirect(authUrl);
        }).catch(error => {
          console.error('[Apple OAuth Init] URL generation error:', error);
          res.redirect('/auth?error=oauth_failed');
        });
      });
    } catch (error) {
      console.error('Apple OAuth initiation error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  app.post('/api/auth/apple/callback', async (req, res) => {
    console.log('[Apple OAuth] Callback received');
    console.log('[Apple OAuth] Body:', JSON.stringify(req.body).substring(0, 200));
    console.log('[Apple OAuth] Session ID:', req.sessionID);
    console.log('[Apple OAuth] Session state:', req.session?.oauthState);
    
    try {
      const { code, state, user } = req.body;
      
      if (!code || !state) {
        console.error('[Apple OAuth] Missing code or state');
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Extract state from "apple:BASE64" format (alugae pattern)
      let actualState = state;
      if (state.startsWith('apple:')) {
        actualState = state.substring(6); // Remove "apple:" prefix
      }
      
      console.log('[Apple OAuth] Validating state...');
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, actualState)) {
        console.error('[Apple OAuth] State validation failed');
        return res.redirect('/auth?error=invalid_state');
      }
      
      console.log('[Apple OAuth] State validated, exchanging code for token...');
      // Exchange code for id_token
      const tokens = await exchangeAppleCode(code);
      
      console.log('[Apple OAuth] Token received, validating...');
      // Validate Apple ID token
      const payload = await validateAppleIdToken(tokens.id_token);
      
      console.log('[Apple OAuth] Token validated, extracting user info...');
      // Extract user info
      const userInfo = extractAppleUserInfo(payload, user ? JSON.parse(user) : undefined);
      console.log('[Apple OAuth] User info:', userInfo.email);
      
      console.log('[Apple OAuth] Creating/linking user...');
      // Create or link OAuth user
      const { user: dbUser, isNewUser } = await createOrLinkOAuthUser('apple', userInfo);
      console.log('[Apple OAuth] User created/linked, role:', dbUser.role);
      
      // Login user with Passport
      req.login(dbUser, (err) => {
        if (err) {
          console.error('[Apple OAuth] Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        console.log('[Apple OAuth] User logged in successfully');
        // Save session explicitly before redirect (important for mobile OAuth)
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('[Apple OAuth] Session save error:', saveErr);
            return res.redirect('/auth?error=session_failed');
          }
          
          // Redirect to appropriate dashboard
          const redirectUrl = getDashboardRedirect(dbUser, isNewUser);
          console.log('[Apple OAuth] Redirecting to:', redirectUrl);
          res.redirect(redirectUrl);
        });
      });
    } catch (error) {
      console.error('[Apple OAuth] Callback error:', error);
      console.error('[Apple OAuth] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      res.redirect('/auth?error=oauth_failed');
    }
  });

  // Alternative OAuth callback routes without /api prefix (for provider redirect URIs)
  app.get('/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, state as string)) {
        return res.redirect('/auth?error=invalid_state');
      }
      
      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code as string);
      const userInfo = await getGoogleUserInfo(tokens.access_token);
      
      // Create or link OAuth user
      const { user, isNewUser } = await createOrLinkOAuthUser('google', {
        providerUserId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImageUrl: userInfo.picture
      });
      
      // Login user with Passport
      req.login(user, (err) => {
        if (err) {
          console.error('Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        // Redirect to appropriate dashboard
        const redirectUrl = getDashboardRedirect(user, isNewUser);
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  app.post('/auth/apple/callback', async (req, res) => {
    console.log('[Apple OAuth ALT] Callback received (no /api prefix)');
    console.log('[Apple OAuth ALT] Body:', JSON.stringify(req.body).substring(0, 200));
    console.log('[Apple OAuth ALT] Session ID:', req.sessionID);
    console.log('[Apple OAuth ALT] Session state:', req.session?.oauthState);
    
    try {
      const { code, state, user } = req.body;
      
      if (!code || !state) {
        console.error('[Apple OAuth ALT] Missing code or state');
        return res.redirect('/auth?error=invalid_oauth_response');
      }
      
      // Extract state from "apple:BASE64" format (alugae pattern)
      let actualState = state;
      if (state.startsWith('apple:')) {
        actualState = state.substring(6); // Remove "apple:" prefix
      }
      
      console.log('[Apple OAuth ALT] Validating state...');
      // Validate state to prevent CSRF
      if (!validateOAuthState(req.session, actualState)) {
        console.error('[Apple OAuth ALT] State validation failed');
        return res.redirect('/auth?error=invalid_state');
      }
      
      console.log('[Apple OAuth ALT] State validated, exchanging code for token...');
      // Exchange code for id_token
      const tokens = await exchangeAppleCode(code);
      
      console.log('[Apple OAuth ALT] Token received, validating...');
      // Validate Apple ID token
      const payload = await validateAppleIdToken(tokens.id_token);
      
      console.log('[Apple OAuth ALT] Token validated, extracting user info...');
      // Extract user info
      const userInfo = extractAppleUserInfo(payload, user ? JSON.parse(user) : undefined);
      console.log('[Apple OAuth ALT] User info:', userInfo.email);
      
      console.log('[Apple OAuth ALT] Creating/linking user...');
      // Create or link OAuth user
      const { user: dbUser, isNewUser } = await createOrLinkOAuthUser('apple', userInfo);
      console.log('[Apple OAuth ALT] User created/linked, role:', dbUser.role);
      
      // Login user with Passport
      req.login(dbUser, (err) => {
        if (err) {
          console.error('[Apple OAuth ALT] Passport login error:', err);
          return res.redirect('/auth?error=login_failed');
        }
        
        console.log('[Apple OAuth ALT] User logged in successfully');
        // Save session explicitly before redirect (important for mobile OAuth)
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('[Apple OAuth ALT] Session save error:', saveErr);
            return res.redirect('/auth?error=session_failed');
          }
          
          console.log('[Apple OAuth ALT] Session saved, redirecting...');
          // Redirect to appropriate dashboard
          const redirectUrl = getDashboardRedirect(dbUser, isNewUser);
          console.log('[Apple OAuth ALT] Redirecting to:', redirectUrl);
          res.redirect(redirectUrl);
        });
      });
    } catch (error) {
      console.error('Apple OAuth callback error:', error);
      res.redirect('/auth?error=oauth_failed');
    }
  });

  // Middleware to check authentication for protected routes
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }

  // Company routes
  app.post("/api/companies", requireAuth, async (req, res) => {
    try {
      const company = await storage.createCompany({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(company);
    } catch (error) {
      console.error("Create company error:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.get("/api/companies/me", requireAuth, async (req, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.id);
      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Professional routes
  app.post("/api/professionals", requireAuth, async (req, res) => {
    try {
      const professional = await storage.createProfessional({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(professional);
    } catch (error) {
      console.error("Create professional error:", error);
      res.status(500).json({ message: "Failed to create professional profile" });
    }
  });

  app.get("/api/professionals/me", requireAuth, async (req, res) => {
    try {
      const professional = await storage.getProfessionalByUserId(req.user.id);
      // Return null explicitly if no professional found (for new users)
      res.json(professional || null);
    } catch (error) {
      console.error("Get professional error:", error);
      res.status(500).json({ message: "Failed to fetch professional profile" });
    }
  });

  app.patch("/api/professionals/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const professional = await storage.getProfessional(id);
      if (!professional || professional.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      // Validate request body - only allow specific fields
      const { updateProfessionalSchema } = await import("@shared/schema");
      const validatedData = updateProfessionalSchema.parse(req.body);

      const updated = await storage.updateProfessional(id, validatedData);
      res.json(updated);
    } catch (error) {
      console.error("Update professional error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error });
      }
      res.status(500).json({ message: "Failed to update professional profile" });
    }
  });

  // Resume upload and parsing endpoint
  app.post("/api/professionals/upload-resume", requireAuth, upload.single('resume'), async (req, res) => {
    console.log('[Resume Upload] Endpoint hit!', { hasFile: !!req.file, user: req.user?.id });
    try {
      if (!req.file) {
        console.log('[Resume Upload] No file in request');
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('[Resume Upload] File:', req.file.originalname, 'Size:', req.file.size, 'bytes');

      // Check if Adobe credentials are configured
      if (!process.env.PDF_SERVICES_CLIENT_ID || !process.env.PDF_SERVICES_CLIENT_SECRET) {
        console.error('[Resume Upload] Adobe PDF Services credentials not configured');
        return res.status(500).json({ 
          message: "PDF extraction service not configured. Please contact support." 
        });
      }

      // Use Adobe PDF Extract API to extract resume data
      console.log('[Resume Upload] Initializing Adobe PDF Services...');
      const credentials = new ServicePrincipalCredentials({
        clientId: process.env.PDF_SERVICES_CLIENT_ID!,
        clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET!
      });

      const pdfServices = new PDFServices({ credentials });
      
      // Convert Buffer to ReadableStream for Adobe SDK
      const readableStream = Readable.from(req.file.buffer);
      
      // Create ExtractPDF job
      console.log('[Resume Upload] Creating PDF extraction job...');
      const inputAsset = await pdfServices.upload({
        readStream: readableStream,
        mimeType: MimeType.PDF
      });

      const params = new ExtractPDFParams({
        elementsToExtract: [ExtractElementType.TEXT]
      });

      const job = new ExtractPDFJob({ inputAsset, params });
      const pollingURL = await pdfServices.submit({ job });
      const pdfServicesResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: ExtractPDFResult
      });

      // Download the result
      const resultAsset = pdfServicesResponse.result?.resource;
      if (!resultAsset) {
        throw new Error('No result asset from Adobe PDF Services');
      }
      
      const streamAsset = await pdfServices.getContent({ asset: resultAsset });
      
      // Read the ZIP result from Adobe
      const chunks: Buffer[] = [];
      for await (const chunk of streamAsset.readStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const zipBuffer = Buffer.concat(chunks);
      
      // Extract the JSON from the ZIP
      console.log('[Resume Upload] Extracting JSON from ZIP...');
      const zip = new AdmZip(zipBuffer);
      const jsonEntry = zip.getEntry('structuredData.json');
      
      if (!jsonEntry) {
        throw new Error('structuredData.json not found in Adobe response ZIP');
      }
      
      const jsonResult = JSON.parse(jsonEntry.getData().toString('utf8'));
      
      // Extract text from the structured JSON
      let fullText = '';
      if (jsonResult.elements) {
        fullText = jsonResult.elements
          .filter((el: any) => el.Text)
          .map((el: any) => el.Text)
          .join(' ');
      }

      console.log('[Resume Upload] Adobe extraction successful, text length:', fullText.length);
      console.log('[Resume Upload] First 500 chars:', fullText.substring(0, 500));

      // Parse the extracted text to find resume data
      console.log('[Resume Upload] Parsing resume data...');
      
      const parsedData: any = {};
      
      // Extract email
      const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        parsedData.email = emailMatch[0];
        console.log('[Resume Upload] Email found:', parsedData.email);
      }
      
      // Extract LinkedIn URL
      const linkedinMatch = fullText.match(/linkedin\.com\/in\/[\w-]+/i);
      if (linkedinMatch) {
        parsedData.linkedinUrl = 'https://' + linkedinMatch[0];
        console.log('[Resume Upload] LinkedIn found:', parsedData.linkedinUrl);
      }
      
      // Extract location (common patterns - more flexible)
      const locationMatch = fullText.match(/(?:Location|Address|City|Brasília|São Paulo|Rio de Janeiro)[\s:]*([^,\n]{2,50}[,]\s*[A-Z]{2})/i) ||
                           fullText.match(/([A-Z][a-zà-ú]+(?:\s+[A-Z][a-zà-ú]+)*,\s*(?:[A-Z]{2}|[A-Z][a-zà-ú]+))/);
      if (locationMatch) {
        parsedData.location = locationMatch[1] || locationMatch[0];
        console.log('[Resume Upload] Location found:', parsedData.location);
      }
      
      // Extract title (usually near the top, after name)
      const lines = fullText.split('\n').filter(l => l.trim());
      console.log('[Resume Upload] Total lines found:', lines.length);
      console.log('[Resume Upload] First 5 lines:', lines.slice(0, 5));
      
      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const line = lines[i].trim();
        // Skip email, phone, location lines
        if (line.match(/@|linkedin|github|phone|tel:|location:|http/i)) continue;
        // Skip short lines
        if (line.length < 10 || line.length > 120) continue;
        // Check if it looks like a job title
        if (line.match(/developer|engineer|designer|manager|analyst|specialist|consultant|architect|engenheiro|desenvolvedor|analista/i)) {
          parsedData.title = line;
          console.log('[Resume Upload] Title found:', parsedData.title);
          break;
        }
      }
      
      // Extract skills (common tech keywords)
      const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'Kotlin', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Spring Boot',
        'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Jenkins', 'GitLab',
        'REST', 'GraphQL', 'API', 'Microservices', 'Agile', 'Scrum', 'TDD', 'BDD',
        'Hibernate', 'JPA', 'Kafka', 'RabbitMQ', 'Terraform', 'Ansible'
      ];
      
      // Escape special regex characters in skill names
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const foundSkills = commonSkills.filter(skill => 
        fullText.match(new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i'))
      );
      if (foundSkills.length > 0) {
        parsedData.skills = foundSkills.slice(0, 30);
        console.log('[Resume Upload] Skills found:', foundSkills.length, 'skills');
      }
      
      // Extract years of experience (EN: years, PT-BR: anos, ES: años)
      const expMatch = fullText.match(/(\d+)\+?\s*(?:years?|anos?|años?)\s*(?:of\s*|de\s*)?(?:experience|experiência|experiencia)/i);
      if (expMatch) {
        parsedData.experience = parseInt(expMatch[1]);
        console.log('[Resume Upload] Experience found:', parsedData.experience, 'years');
      }
      
      // Extract bio/summary (EN/PT-BR/ES)
      const summaryMatch = fullText.match(/(?:Summary|About|Profile|Objective|Professional|Resumo|Perfil|Sobre|Resumen|Perfil Profesional)[\s:]*\n([\s\S]{50,500}?)(?:\n\n|Experience|Education|Skills|EXPERIENCE|EDUCATION|EXPERIENCIA|FORMACIÓN)/i);
      if (summaryMatch) {
        parsedData.bio = summaryMatch[1].trim().substring(0, 500);
        console.log('[Resume Upload] Bio found, length:', parsedData.bio.length);
      }
      
      // Extract work experience - FLEXIBLE approach supporting multiple formats
      // Supports: "Position | Company", "Company - JobType", "Position at Company", stacked lines
      const workExperience: any[] = [];
      
      // Pattern: Find all date ranges in format "Month YYYY - Month YYYY" or "Month YYYY - Present"
      // Supports: English (January, Present), Portuguese (Janeiro, Atual), Spanish (Enero, Presente, Actual)
      const dateRangePattern = /([A-Z][a-zà-úÀ-Ú]+)\s+(\d{4})\s*[-–]\s*(?:(Present|Current|Atual|Presente|Actual)|([A-Z][a-zà-úÀ-Ú]+)\s+(\d{4}))/gi;
      let dateMatch;
      
      while ((dateMatch = dateRangePattern.exec(fullText)) && workExperience.length < 10) {
        const startMonth = dateMatch[1];
        const startYear = dateMatch[2];
        const isCurrent = !!dateMatch[3];
        const endMonth = dateMatch[4] || undefined;
        const endYear = dateMatch[5] || undefined;
        
        // Look backwards for position and company (up to 300 chars before the date)
        const textBefore = fullText.substring(Math.max(0, dateMatch.index - 300), dateMatch.index);
        const lines = textBefore.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length >= 1) {
          // Get last 2-3 lines for context
          const lastLine = lines[lines.length - 1];
          const secondLastLine = lines.length >= 2 ? lines[lines.length - 2] : '';
          
          let position = '';
          let company = '';
          
          // Format 1: "Position | Company" (pipe separator)
          const pipeMatch = lastLine.match(/([^|]+)\s*\|\s*([^|]+?)(?:\s*\|.*)?$/);
          if (pipeMatch) {
            position = pipeMatch[1].trim();
            company = pipeMatch[2].trim();
          }
          
          // Format 2: "Company - JobType" or "Company – Full-Time" (hyphen/en-dash separator)
          if (!position && lastLine.match(/[-–]/)) {
            const parts = lastLine.split(/\s*[-–]\s*/);
            if (parts.length >= 2) {
              // First part is company, second is job type (Full-Time, Part-Time, Contract, etc.)
              company = parts[0].trim();
              // If we have a second line, it might be the position
              if (secondLastLine && secondLastLine.length > 5 && secondLastLine.length < 100) {
                position = secondLastLine;
              } else {
                // Use job type as position if no second line
                position = parts[1].trim();
              }
            }
          }
          
          // Format 3: "Position at Company"
          if (!position) {
            const atMatch = lastLine.match(/(.+?)\s+(?:at|em|en)\s+(.+)/i);
            if (atMatch) {
              position = atMatch[1].trim();
              company = atMatch[2].trim();
            }
          }
          
          // Format 4: Stacked lines - position on one line, company on next
          if (!position && secondLastLine) {
            position = secondLastLine;
            company = lastLine;
          }
          
          // Validate it looks like a job (not a section header)
          if (position && company && position.length > 2 && position.length < 150 && company.length > 2 && company.length < 150) {
            // Skip if it looks like a section header
            if (!position.match(/^(?:EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|EXPERIÊNCIA|EDUCAÇÃO|HABILIDADES|CERTIFICAÇÕES|EXPERIENCIA|EDUCACIÓN|FORMACIÓN)$/i)) {
              workExperience.push({
                position,
                company,
                isCurrent,
                startMonth,
                startYear,
                endMonth,
                endYear,
                description: ''
              });
            }
          }
        }
      }
      
      if (workExperience.length > 0) {
        parsedData.workExperience = workExperience;
        console.log('[Resume Upload] Work experience found:', workExperience.length, 'positions');
      } else {
        console.log('[Resume Upload] No work experience found');
      }
      
      // Extract education - FLEXIBLE approach (EN/PT-BR/ES)
      // Supports: "Course | Institution", "Institution - Degree", stacked lines
      const education: any[] = [];
      const yearRangePattern = /(\d{4})\s*[-–]\s*(\d{4}|Present|Current|Atual|Presente|Actual)/gi;
      let eduMatch;
      
      while ((eduMatch = yearRangePattern.exec(fullText)) && education.length < 5) {
        const startYear = eduMatch[1];
        const endYear = eduMatch[2].match(/\d{4}/) ? eduMatch[2] : undefined;
        const isCurrent = eduMatch[2].match(/Present|Current|Atual|Presente|Actual/i);
        
        // Look backwards for course and institution (up to 300 chars)
        const textBefore = fullText.substring(Math.max(0, eduMatch.index - 300), eduMatch.index);
        const lines = textBefore.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length >= 1) {
          const lastLine = lines[lines.length - 1];
          const secondLastLine = lines.length >= 2 ? lines[lines.length - 2] : '';
          
          let course = '';
          let institution = '';
          
          // Format 1: "Course | Institution" (pipe separator)
          const pipeMatch = lastLine.match(/([^|]+)\s*\|\s*([^|]+?)(?:\s*\(.*?\))?(?:\s*\|.*)?$/);
          if (pipeMatch) {
            course = pipeMatch[1].trim();
            institution = pipeMatch[2].trim();
          }
          
          // Format 2: "Institution - Degree" or "University – Bachelor's"
          if (!course && lastLine.match(/[-–]/)) {
            const parts = lastLine.split(/\s*[-–]\s*/);
            if (parts.length >= 2) {
              institution = parts[0].trim();
              course = parts[1].trim();
              // Check if previous line has more context
              if (secondLastLine && secondLastLine.length > 5) {
                course = secondLastLine;
              }
            }
          }
          
          // Format 3: Stacked lines - course on one line, institution on next
          if (!course && secondLastLine) {
            course = secondLastLine;
            institution = lastLine;
          }
          
          // Validate it looks like education (not work experience)
          // Education keywords: degree, engineering, bachelor, master, university, college, etc.
          const eduKeywords = /bachelor|master|phd|degree|engineering|science|arts|university|college|licenciatura|bacharelado|mestrado|doutorado|engenharia|ciências|universidade|faculdade|universidad|ingeniería|maestría|doctorado/i;
          const hasEduKeyword = eduKeywords.test(course) || eduKeywords.test(institution);
          
          if (course && institution && course.length > 3 && institution.length > 3) {
            // Skip if looks like work experience (has company/job keywords)
            const workKeywords = /inc\.|ltd\.|llc|corporation|company|consulting|solutions|full-time|part-time|contract/i;
            const hasWorkKeyword = workKeywords.test(course) || workKeywords.test(institution);
            
            if (!hasWorkKeyword || hasEduKeyword) {
              education.push({
                formation: 'Superior',
                degree: 'Graduação',
                status: isCurrent ? 'Cursando' : 'Completo',
                course,
                institution,
                startMonth: 'Janeiro',
                startYear,
                endMonth: isCurrent ? undefined : 'Dezembro',
                endYear: isCurrent ? undefined : endYear
              });
            }
          }
        }
      }
      
      if (education.length > 0) {
        parsedData.education = education;
        console.log('[Resume Upload] Education found:', education.length, 'entries');
      } else {
        console.log('[Resume Upload] No education found');
      }
      
      // Extract certifications - simplified approach (EN/PT-BR/ES)
      // Look for the certifications section and extract lines
      const certifications: any[] = [];
      const certSectionMatch = fullText.match(/(?:CERTIFICATIONS?|CERTIFICATES?|CERTIFICAÇÕES|CERTIFICADOS|LICENCIAS)[\s\S]{0,1000}/i);
      
      if (certSectionMatch) {
        console.log('[Resume Upload] Certifications section found');
        const certText = certSectionMatch[0];
        
        // Split into lines and process each line
        const lines = certText.split('\n');
        
        for (let i = 1; i < lines.length && certifications.length < 10; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines, section headers, and very short lines (EN/PT-BR/ES)
          if (!line || line.length < 10 || line.match(/^(?:CERTIFICATIONS?|CERTIFICATES?|CERTIFICAÇÕES|CERTIFICADOS|LICENCIAS|LANGUAGES?|IDIOMAS|EDUCATION|EDUCAÇÃO|EDUCACIÓN|FORMACIÓN|SKILLS?|HABILIDADES)$/i)) {
            continue;
          }
          
          // Stop if we hit another section (EN/PT-BR/ES)
          if (line.match(/^(?:LANGUAGES?|IDIOMAS|EDUCATION|EDUCAÇÃO|EDUCACIÓN|FORMACIÓN|SKILLS?|HABILIDADES|EXPERIENCE|EXPERIÊNCIA|EXPERIENCIA)/i)) {
            break;
          }
          
          // Extract year if present
          const yearMatch = line.match(/\b(20\d{2})\b/);
          const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
          
          // Clean the certification name
          let name = line
            .replace(/^[-•*]\s*/, '') // Remove bullets
            .replace(/\b20\d{2}\b/, '') // Remove year
            .replace(/\s+/g, ' ')
            .trim();
          
          // Validate it looks like a certification
          if (name.length > 5 && name.length < 150) {
            certifications.push({
              name,
              issuer: '',
              year
            });
          }
        }
        
        if (certifications.length > 0) {
          parsedData.certifications = certifications;
          console.log('[Resume Upload] Certifications found:', certifications.length, 'entries');
        } else {
          console.log('[Resume Upload] No certifications extracted');
        }
      } else {
        console.log('[Resume Upload] Certifications section not found');
      }
      
      console.log('[Resume Upload] Data extraction successful:', Object.keys(parsedData));

      // Save resume file to Object Storage
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      // Upload file to presigned URL
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: req.file.buffer,
        headers: {
          'Content-Type': 'application/pdf'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      console.log('[Resume Upload] File uploaded to Object Storage');

      // Normalize the path
      const resumeUrl = objectStorageService.normalizeObjectEntityPath(uploadURL);

      // Update professional profile with resume URL
      const professional = await storage.getProfessionalByUserId(req.user!.id);
      if (professional) {
        console.log('[Resume Upload] Updating professional profile with resume URL...');
        await storage.updateProfessional(professional.id, { resumeUrl });
        console.log('[Resume Upload] Professional profile updated successfully');
      }

      res.json({
        success: true,
        message: "Resume uploaded and analyzed successfully",
        resumeUrl,
        fileName: req.file.originalname,
        parsedData
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        message: "Failed to process resume", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.searchJobs({
        skills: req.query.skills as string[],
        type: req.query.type as string,
        status: "active"
      });
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", requireAuth, async (req, res) => {
    try {
      // Get user's company
      const company = await storage.getCompanyByUserId(req.user.id);
      if (!company) {
        return res.status(400).json({ message: "Company profile required to post jobs" });
      }

      const job = await storage.createJob({
        ...req.body,
        companyId: company.id
      });
      res.status(201).json(job);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Job recommendations for professionals
  app.get("/api/professionals/me/job-recommendations", requireAuth, async (req, res) => {
    try {
      const professional = await storage.getProfessionalByUserId(req.user!.id);
      if (!professional) {
        return res.json([]); // Return empty array if no profile
      }

      // TODO: Implement AI-based job recommendations
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Get job recommendations error:", error);
      res.status(500).json({ message: "Failed to fetch job recommendations" });
    }
  });

  // Contracts for professionals
  app.get("/api/contracts/my", requireAuth, async (req, res) => {
    try {
      const professional = await storage.getProfessionalByUserId(req.user!.id);
      if (!professional) {
        return res.json([]); // Return empty array if no profile
      }

      // TODO: Implement contracts functionality
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Get contracts error:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Application routes
  app.get("/api/applications/my", requireAuth, async (req, res) => {
    try {
      const professional = await storage.getProfessionalByUserId(req.user!.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const applications = await storage.getApplicationsByProfessional(professional.id);
      
      const applicationsWithJobs = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJob(app.jobId);
          const company = job ? await storage.getCompany(job.companyId) : null;
          return {
            ...app,
            job: job ? {
              id: job.id,
              title: job.title,
              description: job.description,
              type: job.type,
              budget: job.budget,
              company: company ? {
                id: company.id,
                name: company.name,
              } : null
            } : null
          };
        })
      );

      res.json(applicationsWithJobs);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      // Get user's professional profile
      const professional = await storage.getProfessionalByUserId(req.user.id);
      if (!professional) {
        return res.status(400).json({ message: "Professional profile required to apply for jobs" });
      }

      const application = await storage.createApplication({
        ...req.body,
        professionalId: professional.id
      });
      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Contact form endpoint with validation and security
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body using shared schema
      const validationResult = contactFormSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.errors 
        });
      }

      const { name, email, company, message } = validationResult.data;

      // Basic rate limiting check (simple IP-based)
      const clientIp = req.ip || req.connection.remoteAddress;
      console.log(`Contact form submission from IP: ${clientIp}`);

      // Input sanitization - remove potentially dangerous characters
      const sanitizedName = name.replace(/[<>]/g, '');
      const sanitizedCompany = company ? company.replace(/[<>]/g, '') : '';
      const sanitizedMessage = message.replace(/[<>]/g, '');

      // Validate Resend API key
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return res.status(500).json({ 
          message: "Configuração de email não disponível" 
        });
      }

      // Initialize Resend client
      const resend = new Resend(process.env.RESEND_API_KEY);

      // In development/testing, Resend only allows sending to the account owner's email
      // In production, use a verified domain to send to any email
      const recipientEmail = process.env.NODE_ENV === 'production' 
        ? 'contact@magenx.tech' 
        : 'asouzamax@gmail.com';

      // Send email using Resend API
      const { data, error } = await resend.emails.send({
        from: 'MaGenX Contact <onboarding@resend.dev>',
        to: recipientEmail,
        replyTo: email,
        subject: `Nova mensagem de contato - ${sanitizedCompany || sanitizedName}`,
        html: `
          <h2>Nova mensagem de contato</h2>
          <p><strong>Nome:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${sanitizedCompany ? `<p><strong>Empresa:</strong> ${sanitizedCompany}</p>` : ''}
          <p><strong>Mensagem:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Enviado via formulário de contato MaGenX</small></p>
        `
      });

      if (error) {
        console.error('Resend API error:', error);
        return res.status(500).json({ 
          message: "Erro ao enviar mensagem. Tente novamente." 
        });
      }

      console.log('Email sent successfully via Resend:', data?.id);
      res.json({ message: "Mensagem enviada com sucesso!" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Erro ao enviar mensagem. Tente novamente." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}