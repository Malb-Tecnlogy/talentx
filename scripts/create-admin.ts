
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function createAdminUser() {
  try {
    const adminEmail = "asouzamax@gmail.com";
    
    // First, delete any existing user with this email
    const deletedUsers = await db.delete(users)
      .where(eq(users.email, adminEmail))
      .returning();
    
    if (deletedUsers.length > 0) {
      console.log(`Deleted ${deletedUsers.length} existing user(s) with email: ${adminEmail}`);
    }
    
    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash("Admin@2025", saltRounds);
    
    // Create the admin user
    const adminUser = await db.insert(users).values({
      email: adminEmail,
      firstName: "Admin",
      lastName: "User", 
      role: "admin",
      passwordHash: passwordHash,
      emailVerified: true
    }).returning();
    
    console.log("Admin user created successfully:", adminUser[0]);
    console.log("Email:", adminUser[0].email);
    console.log("Role:", adminUser[0].role);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
