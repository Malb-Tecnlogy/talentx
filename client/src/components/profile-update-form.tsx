import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CheckCircle2, Upload, Sparkles, FileText } from "lucide-react";

const profileUpdateSchema = z.object({
  // Professional info
  title: z.string().optional(),
  bio: z.string().optional(),
  experience: z.number().min(0).optional(),
  hourlyRate: z.string().optional(),
  availability: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  
  // Portfolio
  portfolio: z.array(z.object({
    title: z.string(),
    description: z.string(),
    url: z.string(),
    tech: z.array(z.string()),
  })).optional(),
  
  // Academic experience
  education: z.array(z.object({
    formation: z.string(),
    degree: z.string(),
    status: z.string(),
    course: z.string(),
    institution: z.string(),
    startMonth: z.string(),
    startYear: z.string(),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
  })).optional(),
  
  // Professional experience  
  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    isCurrent: z.boolean(),
    startMonth: z.string(),
    startYear: z.string(),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
    description: z.string(),
  })).optional(),
  
  // Certifications
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
  })).optional(),
  
  // Personal data
  gender: z.string().optional(),
  hasDisability: z.boolean().optional(),
  disabilityDetails: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  linkedinUrl: z.string().optional(),
  
  // Diversity
  originState: z.string().optional(),
  originCity: z.string().optional(),
  pronoun: z.string().optional(),
  genderIdentity: z.string().optional(),
  sexualOrientation: z.string().optional(),
  race: z.string().optional(),
  diversityConsent: z.boolean().optional(),
  
  // Skills
  skills: z.array(z.string()).max(30).optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

export function ProfileUpdateForm({ professional }: { professional: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      title: professional?.title || "",
      bio: professional?.bio || "",
      experience: professional?.experience || 0,
      hourlyRate: professional?.hourlyRate || "",
      availability: professional?.availability || "available",
      location: professional?.location || "",
      timezone: professional?.timezone || "",
      portfolio: professional?.portfolio || [],
      education: professional?.education || [],
      workExperience: professional?.workExperience || [],
      certifications: professional?.certifications || [],
      gender: professional?.gender || "",
      hasDisability: professional?.hasDisability || false,
      disabilityDetails: professional?.disabilityDetails || "",
      address: professional?.address || "",
      zipCode: professional?.zipCode || "",
      state: professional?.state || "",
      city: professional?.city || "",
      linkedinUrl: professional?.linkedinUrl || "",
      originState: professional?.originState || "",
      originCity: professional?.originCity || "",
      pronoun: professional?.pronoun || "",
      genderIdentity: professional?.genderIdentity || "",
      sexualOrientation: professional?.sexualOrientation || "",
      race: professional?.race || "",
      diversityConsent: professional?.diversityConsent || false,
      skills: professional?.skills || [],
    },
  });

  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({
    control: form.control,
    name: "portfolio",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateFormData) => {
      const res = await apiRequest("PATCH", `/api/professionals/${professional.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals/me"] });
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateFormData) => {
    updateMutation.mutate(data);
  };

  const addSkill = () => {
    const currentSkills = form.getValues("skills") || [];
    if (newSkill && currentSkills.length < 30 && !currentSkills.includes(newSkill)) {
      form.setValue("skills", [...currentSkills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter(s => s !== skill));
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[Resume Upload] File selected:', file.name, file.size, 'bytes');

    if (file.type !== 'application/pdf') {
      toast({
        title: "Erro",
        description: "Por favor, envie apenas arquivos PDF.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFileName(file.name);
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      console.log('[Resume Upload] Sending request to server...');
      const response = await fetch('/api/professionals/upload-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('[Resume Upload] Server response:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('[Resume Upload] Error response:', errorData);
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('[Resume Upload] Success! File uploaded:', result);

      // Auto-fill form fields with parsed data from OpenAI
      const { parsedData } = result;
      let filledFields = 0;
      
      if (parsedData) {
        if (parsedData.title) {
          form.setValue('title', parsedData.title);
          filledFields++;
        }
        if (parsedData.bio) {
          form.setValue('bio', parsedData.bio);
          filledFields++;
        }
        if (parsedData.location) {
          form.setValue('location', parsedData.location);
          filledFields++;
        }
        if (parsedData.experience) {
          form.setValue('experience', parsedData.experience);
          filledFields++;
        }
        if (parsedData.skills && parsedData.skills.length > 0) {
          form.setValue('skills', parsedData.skills.slice(0, 30));
          filledFields++;
        }
        if (parsedData.linkedinUrl) {
          form.setValue('linkedinUrl', parsedData.linkedinUrl);
          filledFields++;
        }
      }

      toast({
        title: "Currículo Analisado!",
        description: filledFields > 0 
          ? `Encontramos ${filledFields} informações no seu currículo e preenchemos automaticamente. Revise os campos abaixo.`
          : `${result.fileName} foi salvo. Preencha os campos do seu perfil abaixo.`,
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar currículo. Por favor, tente novamente ou preencha o formulário manualmente.",
        variant: "destructive",
      });
    } finally {
      setUploadingResume(false);
      setSelectedFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          Preencha os blocos com seus dados e mantenha seu currículo atualizado para se candidatar às vagas. 
          Caso realize alterações, estes ajustes serão <strong>replicados para todas as suas candidaturas ativas.</strong>
        </div>

        {/* Resume Upload Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Atualização Rápida: Envie Seu Currículo
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Economize tempo! Envie seu currículo em PDF e nossa IA preencherá automaticamente os campos do seu perfil.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                className="hidden"
                id="resume-upload-update"
                data-testid="input-resume-upload"
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingResume}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-upload-resume"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingResume ? "Processando..." : "Enviar Currículo (PDF)"}
                </Button>
                {selectedFileName && (
                  <span className="text-sm text-muted-foreground">
                    {selectedFileName}
                  </span>
                )}
              </div>

              <Alert className="bg-blue-100/50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
                <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>Dica:</strong> Certifique-se de que seu currículo inclui suas habilidades, experiência profissional, 
                  formação acadêmica e informações de contato para melhores resultados. Tamanho máximo: 10MB.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Accordion type="multiple" className="space-y-4">
          {/* Professional Information */}
          <AccordionItem value="professional-info">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Informações Profissionais</span>
                {form.getValues("title") && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Profissional</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Desenvolvedor Full Stack" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São Paulo, SP" {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conte um pouco sobre você e sua experiência profissional..." 
                        className="min-h-[100px]"
                        {...field}
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anos de Experiência</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value || 0}
                          data-testid="input-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa Horária (USD)</FormLabel>
                      <FormControl>
                        <Input placeholder="50.00" {...field} data-testid="input-hourly-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-availability">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="busy">Ocupado</SelectItem>
                          <SelectItem value="unavailable">Indisponível</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuso Horário</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: America/Sao_Paulo" {...field} data-testid="input-timezone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Portfolio */}
          <AccordionItem value="portfolio">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Portfólio</span>
                {portfolioFields.length > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground">
                Adicione seus projetos mais relevantes para demonstrar suas habilidades.
              </p>

              {portfolioFields.map((field, index) => (
                <Card key={field.id} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Projeto {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePortfolio(index)}
                        data-testid={`button-remove-portfolio-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`portfolio.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Projeto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: E-commerce Platform" {...field} data-testid={`input-portfolio-title-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`portfolio.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva o projeto..." 
                              {...field}
                              data-testid={`input-portfolio-description-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`portfolio.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Projeto *</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} data-testid={`input-portfolio-url-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`portfolio.${index}.tech`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tecnologias (separadas por vírgula) *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="React, Node.js, PostgreSQL" 
                              value={field.value?.join(", ") || ""}
                              onChange={(e) => field.onChange(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                              data-testid={`input-portfolio-tech-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendPortfolio({ title: "", description: "", url: "", tech: [] })}
                data-testid="button-add-portfolio"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Projeto
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Academic Experience */}
          <AccordionItem value="education">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Experiência</span>
                {educationFields.length > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div>
                <h3 className="font-medium mb-4">Experiência acadêmica</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode informar mais de uma experiência acadêmica, caso seja necessário.
                </p>

                {educationFields.map((field, index) => (
                  <Card key={field.id} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-base">Experiência acadêmica {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.formation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Formação *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Superior">Superior</SelectItem>
                                  <SelectItem value="Mestrado">Mestrado</SelectItem>
                                  <SelectItem value="Doutorado">Doutorado</SelectItem>
                                  <SelectItem value="Pós-Doutorado">Pós-Doutorado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grau *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Graduação">Graduação</SelectItem>
                                  <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                                  <SelectItem value="Bacharel">Bacharel</SelectItem>
                                  <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                                  <SelectItem value="Mestrado">Mestrado</SelectItem>
                                  <SelectItem value="Doutorado">Doutorado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Completo">Completo</SelectItem>
                                  <SelectItem value="Cursando">Cursando</SelectItem>
                                  <SelectItem value="Trancado">Trancado</SelectItem>
                                  <SelectItem value="Incompleto">Incompleto</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.course`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Curso *</FormLabel>
                              <FormControl>
                                <Input placeholder="Information Systems degree" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`education.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instituição *</FormLabel>
                            <FormControl>
                              <Input placeholder="Universidade Paulista UNIP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.startMonth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Início *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.startYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>&nbsp;</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.endMonth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fim *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.endYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>&nbsp;</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover formação
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendEducation({
                    formation: "",
                    degree: "",
                    status: "",
                    course: "",
                    institution: "",
                    startMonth: "",
                    startYear: "",
                    endMonth: "",
                    endYear: "",
                  })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar outra formação
                </Button>
              </div>

              {/* Professional Experience */}
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Experiência profissional</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode informar mais de uma experiência profissional, caso seja necessário.
                </p>

                {workFields.map((field, index) => (
                  <Card key={field.id} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-base">Experiência profissional {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa *</FormLabel>
                              <FormControl>
                                <Input placeholder="ANDERSON DE SOUZA ALVES" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo *</FormLabel>
                              <FormControl>
                                <Input placeholder="Software Architect" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.isCurrent`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Meu emprego atual</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.startMonth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Início *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.startYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>&nbsp;</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição das atividades</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="As a Solutions Architect, I have developed and delivered innovative solutions..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeWork(index)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover experiência
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendWork({
                    company: "",
                    position: "",
                    isCurrent: false,
                    startMonth: "",
                    startYear: "",
                    endMonth: "",
                    endYear: "",
                    description: "",
                  })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar outra experiência
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Certifications */}
          <AccordionItem value="certifications">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Certificações</span>
                {certificationFields.length > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground">
                Adicione suas certificações profissionais relevantes.
              </p>

              {certificationFields.map((field, index) => (
                <Card key={field.id} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Certificação {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index)}
                        data-testid={`button-remove-certification-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Certificação *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: AWS Certified Solutions Architect" {...field} data-testid={`input-certification-name-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issuer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instituição Emissora *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Amazon Web Services" {...field} data-testid={`input-certification-issuer-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.year`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano de Obtenção *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2024" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                              value={field.value || ""}
                              data-testid={`input-certification-year-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendCertification({ name: "", issuer: "", year: new Date().getFullYear() })}
                data-testid="button-add-certification"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Certificação
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Personal Data */}
          <AccordionItem value="personal">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Dados Pessoais</span>
                {form.watch("gender") && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <p className="text-sm text-muted-foreground mb-2">
                      Selecione o gênero que você se identifica *
                    </p>
                    <div className="flex gap-4">
                      {["Feminino", "Masculino", "Não-binário", "Outros", "Prefiro não responder"].map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={field.value === option ? "default" : "outline"}
                          onClick={() => field.onChange(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasDisability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deficiência</FormLabel>
                    <p className="text-sm text-muted-foreground mb-2">
                      Você quer se candidatar para a vaga como Pessoa com Deficiência? 
                      Saiba mais sobre nosso <a href="#" className="text-primary underline">aviso de privacidade</a>. *
                    </p>
                    <div className="flex gap-4">
                      {[
                        { label: "Não", value: false },
                        { label: "Sim", value: true },
                      ].map((option) => (
                        <Button
                          key={option.label}
                          type="button"
                          variant={field.value === option.value ? "default" : "outline"}
                          onClick={() => field.onChange(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="font-medium mb-4">Endereço</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Lembre-se, este endereço será utilizado em todas as suas inscrições.
                </p>
                
                <p className="text-sm font-medium mb-2">Você mora no Brasil? *</p>
                <div className="flex gap-4 mb-4">
                  <Button type="button" variant="default">Sim</Button>
                  <Button type="button" variant="outline">Não</Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP (Código de Endereçamento Postal) *</FormLabel>
                        <FormControl>
                          <Input placeholder="72300-641" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Q 302 Cj 8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Distrito Federal">Distrito Federal</SelectItem>
                            <SelectItem value="São Paulo">São Paulo</SelectItem>
                            <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                            {/* Add all Brazilian states */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="Brasília" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil do LinkedIn</FormLabel>
                    <p className="text-sm text-muted-foreground mb-2">
                      Link (URL) do seu perfil (opcional)
                    </p>
                    <FormControl>
                      <Input placeholder="www.linkedin.com/in/anderson-ssouza-alves" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" className="w-full">
                Salvar e continuar
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Diversity */}
          <AccordionItem value="diversity">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Diversidade</span>
                {form.watch("diversityConsent") && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
                <p className="text-sm">
                  O preenchimento desta seção é opcional. As informações serão usadas em todos os processos que utilizam a solução de Diversidade. 
                  Nenhum dado será utilizado como critério de eliminação.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de origem:</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Distrito Federal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Distrito Federal">Distrito Federal</SelectItem>
                          {/* Add all states */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="originCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade de origem:</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Brasília" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Brasília">Brasília</SelectItem>
                          {/* Add cities */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pronoun"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual o pronome adequado para você:</FormLabel>
                      <div className="space-y-2">
                        {["Ela / Dele", "Ele / Dele", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genderIdentity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual sua identidade de gênero:</FormLabel>
                      <div className="space-y-2">
                        {["Cisgênero", "Transgênero", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sexualOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual sua orientação sexual:</FormLabel>
                      <div className="space-y-2">
                        {["Assexual", "Bissexual", "Heterossexual", "Homossexual", "Pansexual", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="race"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual sua cor ou raça:</FormLabel>
                      <div className="space-y-2">
                        {["Amarela", "Branca", "Indígena", "Parda", "Preta", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="diversityConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Eu concordo em compartilhar esses dados com as empresas para que possam ser realizadas ações voltadas à promoção de diversidade
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Acesse o <a href="#" className="text-primary underline">Aviso de Privacidade da Gupy</a>.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="button" className="w-full">
                Salvar
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Habilidades</span>
                {(form.watch("skills") || []).length > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode informar até 30 habilidades que possui. (As habilidades envolvem desde conhecimentos técnicos até o modo como você se relaciona com as pessoas). 
                  Para mais informações, acesse a nossa <a href="#" className="text-primary underline">Central de ajuda</a>.
                </p>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Escreva e selecione uma habilidade"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill}>
                    Adicionar
                  </Button>
                </div>

                <p className="text-sm font-medium mb-2">
                  {(form.watch("skills") || []).length} de 30 habilidades
                </p>

                <div className="flex flex-wrap gap-2">
                  {(form.watch("skills") || []).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  ⚠️ Não se esqueça de clicar no botão "Salvar" após realizar as alterações
                </p>
              </div>

              <Button type="button" className="w-full">
                Salvar
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending ? "Salvando..." : "Salvar todas as alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
