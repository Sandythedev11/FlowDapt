import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to FlowDapt ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>
            <p>
              By using FlowDapt, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
            <p className="mb-4">We collect the following personal information when you register and use our services:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, and password (encrypted)</li>
              <li><strong>Profile Data:</strong> User preferences, settings, and account configuration</li>
              <li><strong>Communication Data:</strong> Email correspondence and support tickets</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Usage Data</h3>
            <p className="mb-4">We automatically collect certain information when you use our platform:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>Upload history and file metadata (not file contents)</li>
              <li>Analytics and performance data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.3 Uploaded Data</h3>
            <p>
              Files you upload to FlowDapt are processed to generate analytics and insights. We store metadata about your uploads but implement strict security measures to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Delivery:</strong> To provide, maintain, and improve our platform</li>
              <li><strong>Account Management:</strong> To create and manage your account</li>
              <li><strong>Email Verification:</strong> To verify your email address and secure your account</li>
              <li><strong>Password Recovery:</strong> To send OTP codes for password reset requests</li>
              <li><strong>Communication:</strong> To send service-related notifications and updates</li>
              <li><strong>Analytics:</strong> To analyze usage patterns and improve user experience</li>
              <li><strong>Security:</strong> To detect, prevent, and address technical issues and security threats</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Password Hashing:</strong> All passwords are hashed using bcrypt with salt rounds before storage</li>
              <li><strong>Email Verification:</strong> OTP-based email verification to ensure account authenticity</li>
              <li><strong>Encrypted Transmission:</strong> Data transmitted over HTTPS/TLS encryption</li>
              <li><strong>Access Controls:</strong> Role-based access control and authentication middleware</li>
              <li><strong>Database Security:</strong> MongoDB with authentication and encrypted connections</li>
              <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors who assist in operating our platform (e.g., email service providers, hosting services)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@flowdapt.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings. Note that disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p>
              FlowDapt is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of FlowDapt after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> privacy@flowdapt.com</li>
              <li><strong>Address:</strong> FlowDapt Inc., [Your Address]</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
