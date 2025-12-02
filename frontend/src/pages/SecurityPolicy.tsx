import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Key, Mail, Database, Eye } from "lucide-react";

const SecurityPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Security Policy</h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Commitment to Security</h2>
            <p className="mb-4">
              At FlowDapt, security is not an afterthought—it's fundamental to everything we do. We understand that you're trusting us with your valuable data, and we take that responsibility seriously. This Security Policy outlines the comprehensive measures we've implemented to protect your information and maintain the integrity of our platform.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">1. Password Security</h2>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">1.1 Password Hashing</h3>
            <p className="mb-4">
              We never store passwords in plain text. All passwords are protected using industry-standard bcrypt hashing algorithm with the following features:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Salt Rounds:</strong> We use 10 salt rounds to ensure computational difficulty against brute-force attacks</li>
              <li><strong>One-Way Encryption:</strong> Passwords are hashed using a one-way function, making them impossible to reverse</li>
              <li><strong>Unique Salts:</strong> Each password receives a unique salt, preventing rainbow table attacks</li>
              <li><strong>Automatic Hashing:</strong> Passwords are automatically hashed before database storage using Mongoose pre-save hooks</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">1.2 Password Requirements</h3>
            <p className="mb-4">To ensure strong passwords, we enforce the following requirements:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Minimum 8 characters in length</li>
              <li>At least one uppercase letter</li>
              <li>At least one number</li>
              <li>Real-time password strength validation</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">2. Email Verification Security</h2>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">2.1 OTP-Based Verification</h3>
            <p className="mb-4">
              We use One-Time Password (OTP) verification to ensure email authenticity and prevent unauthorized account creation:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>6-Digit OTP:</strong> Randomly generated numeric codes for easy entry</li>
              <li><strong>Time-Limited:</strong> OTPs expire after 10 minutes to minimize security risks</li>
              <li><strong>Single Use:</strong> Each OTP can only be used once and is invalidated after verification</li>
              <li><strong>Secure Storage:</strong> OTPs are stored with select: false to prevent accidental exposure</li>
              <li><strong>Resend Protection:</strong> Rate limiting on OTP resend requests to prevent abuse</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Email Service Integration</h3>
            <p className="mb-4">
              We use Gmail SMTP with Nodemailer for all email operations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reliable email delivery via Gmail's trusted infrastructure</li>
              <li>Professional HTML email templates</li>
              <li>Secure App Password authentication</li>
              <li>TLS encryption for all email transmissions</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">3. Password Reset Security</h2>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">3.1 Secure Reset Process</h3>
            <p className="mb-4">
              Our password reset process is designed with multiple security layers:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Email Validation:</strong> Reset OTPs are only sent to registered email addresses</li>
              <li><strong>User Verification:</strong> System verifies user existence before generating OTP</li>
              <li><strong>Time-Limited OTP:</strong> Reset codes expire after 10 minutes</li>
              <li><strong>Secure Transmission:</strong> OTPs sent via encrypted email channels</li>
              <li><strong>Immediate Invalidation:</strong> OTP is deleted from database after successful password reset</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Reset Flow Security</h3>
            <p className="mb-4">The password reset process follows these secure steps:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>User requests password reset with email address</li>
              <li>System validates email exists in database</li>
              <li>OTP generated and stored with expiration timestamp</li>
              <li>OTP sent to verified email address</li>
              <li>User submits OTP for verification</li>
              <li>System validates OTP and expiration</li>
              <li>New password is hashed and stored</li>
              <li>OTP is permanently deleted</li>
              <li>User receives confirmation and new JWT token</li>
            </ol>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">4. Database Security</h2>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">4.1 MongoDB Security</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Authentication:</strong> Database access requires username and password authentication</li>
              <li><strong>Encrypted Connections:</strong> All database connections use TLS/SSL encryption</li>
              <li><strong>IP Whitelisting:</strong> Database access restricted to authorized IP addresses</li>
              <li><strong>Role-Based Access:</strong> Database users have minimal required permissions</li>
              <li><strong>Regular Backups:</strong> Automated daily backups with encryption</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Data Protection</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Field-Level Security:</strong> Sensitive fields marked with select: false</li>
              <li><strong>Schema Validation:</strong> Mongoose schemas enforce data integrity</li>
              <li><strong>Unique Constraints:</strong> Email uniqueness enforced at database level</li>
              <li><strong>Indexed Fields:</strong> Optimized queries prevent performance-based vulnerabilities</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">5. Authentication & Authorization</h2>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">5.1 JWT Token Security</h3>
            <p className="mb-4">
              We use JSON Web Tokens (JWT) for secure, stateless authentication:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Signed Tokens:</strong> All tokens signed with secret key to prevent tampering</li>
              <li><strong>Expiration:</strong> Tokens expire after 7 days, requiring re-authentication</li>
              <li><strong>Payload Minimization:</strong> Tokens contain only essential user ID</li>
              <li><strong>Secure Transmission:</strong> Tokens transmitted via Authorization header</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.2 Protected Routes</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Middleware-based authentication for all protected endpoints</li>
              <li>Token validation on every request</li>
              <li>User verification against database</li>
              <li>Role-based access control (RBAC) for admin features</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">6. Application Security</h2>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">6.1 Input Validation</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Server-side validation for all user inputs</li>
              <li>Email format validation using regex patterns</li>
              <li>Password strength requirements enforcement</li>
              <li>File type and size validation for uploads</li>
              <li>SQL injection prevention through parameterized queries</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.2 Error Handling</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Centralized error handling middleware</li>
              <li>Generic error messages to prevent information disclosure</li>
              <li>Detailed logging for security monitoring</li>
              <li>Rate limiting on authentication endpoints</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.3 CORS & Headers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>CORS configured to allow only trusted origins</li>
              <li>Security headers to prevent XSS and clickjacking</li>
              <li>Content Security Policy (CSP) implementation</li>
              <li>HTTPS enforcement for all connections</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. File Upload Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>File Type Validation:</strong> Only CSV, Excel, and PDF files accepted</li>
              <li><strong>Size Limits:</strong> Maximum 10MB file size to prevent DoS attacks</li>
              <li><strong>Virus Scanning:</strong> Uploaded files scanned for malware</li>
              <li><strong>Isolated Processing:</strong> File processing in sandboxed environment</li>
              <li><strong>User-Specific Access:</strong> Users can only access their own uploads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Monitoring & Incident Response</h2>
            <h3 className="text-xl font-semibold mb-3">8.1 Security Monitoring</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Real-time logging of security events</li>
              <li>Failed login attempt tracking</li>
              <li>Unusual activity detection</li>
              <li>Regular security audits and penetration testing</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">8.2 Incident Response</h3>
            <p className="mb-4">
              In the event of a security incident, we have a comprehensive response plan:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Immediate containment and investigation</li>
              <li>User notification within 72 hours of discovery</li>
              <li>Detailed incident analysis and reporting</li>
              <li>Implementation of preventive measures</li>
              <li>Cooperation with law enforcement when necessary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Compliance & Standards</h2>
            <p className="mb-4">
              FlowDapt adheres to industry-standard security practices and compliance requirements:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>OWASP Top 10 security guidelines</li>
              <li>GDPR compliance for data protection</li>
              <li>Regular security updates and patches</li>
              <li>Third-party security assessments</li>
              <li>Employee security training and awareness</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. User Responsibilities</h2>
            <p className="mb-4">
              While we implement robust security measures, users also play a crucial role:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use strong, unique passwords</li>
              <li>Never share your password or OTP codes</li>
              <li>Log out from shared devices</li>
              <li>Report suspicious activity immediately</li>
              <li>Keep your email account secure</li>
              <li>Review account activity regularly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Reporting Security Issues</h2>
            <p className="mb-4">
              We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly:
            </p>
            <ul className="list-none space-y-2 mb-4">
              <li><strong>Email:</strong> security@flowdapt.com</li>
              <li><strong>Response Time:</strong> We aim to respond within 24 hours</li>
              <li><strong>Disclosure:</strong> Please allow us time to fix issues before public disclosure</li>
            </ul>
            <p>
              We appreciate responsible disclosure and may offer recognition or rewards for valid security reports.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Updates to This Policy</h2>
            <p>
              We regularly review and update our security measures. This Security Policy will be updated to reflect any significant changes. The "Last updated" date at the top indicates the most recent revision.
            </p>
          </section>

          <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-semibold mb-4">Contact Security Team</h2>
            <p className="mb-4">
              For security-related questions or concerns:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> security@flowdapt.com</li>
              <li><strong>Emergency:</strong> Available 24/7 for critical security issues</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;
