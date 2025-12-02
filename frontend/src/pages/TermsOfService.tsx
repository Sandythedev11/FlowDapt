import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              Welcome to FlowDapt. By accessing or using our platform, you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these terms, you may not access our services.
            </p>
            <p>
              FlowDapt is a modern workflow-driven, adaptive data analytics platform designed to help teams transform their data into actionable insights. These Terms govern your use of our website, applications, and services (collectively, the "Services").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p className="mb-4">
              FlowDapt provides AI-powered data analytics and visualization services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Data file upload and processing (CSV, Excel, PDF)</li>
              <li>Automated data analysis and insights generation</li>
              <li>Interactive data visualizations and dashboards</li>
              <li>User account management and authentication</li>
              <li>Email verification and password recovery services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold mb-3">3.1 Registration</h3>
            <p className="mb-4">
              To use certain features of FlowDapt, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Verify your email address through our OTP verification system</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Account Security</h3>
            <p className="mb-4">
              You are responsible for safeguarding your account credentials. FlowDapt implements industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Password hashing using bcrypt encryption</li>
              <li>Email verification via OTP (One-Time Password)</li>
              <li>Secure password reset procedures</li>
              <li>JWT-based authentication tokens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Services for any illegal or unauthorized purpose</li>
              <li>Upload malicious files, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Services or servers</li>
              <li>Use automated systems to access the Services without permission</li>
              <li>Impersonate another person or entity</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Upload content that infringes intellectual property rights</li>
              <li>Engage in data scraping or harvesting without consent</li>
              <li>Resell or redistribute our Services without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. User Content and Data</h2>
            <h3 className="text-xl font-semibold mb-3">5.1 Your Data</h3>
            <p className="mb-4">
              You retain all rights to the data you upload to FlowDapt. By uploading data, you grant us a limited license to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Process and analyze your data to provide our Services</li>
              <li>Store your data securely on our servers</li>
              <li>Generate insights and visualizations from your data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.2 Data Responsibility</h3>
            <p className="mb-4">You represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You have the right to upload and process the data</li>
              <li>Your data does not violate any laws or third-party rights</li>
              <li>You have obtained necessary consents for data processing</li>
              <li>Your data does not contain sensitive personal information without proper authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="mb-4">
              The Services, including all content, features, and functionality, are owned by FlowDapt and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of our Services without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Subscription and Payment</h2>
            <h3 className="text-xl font-semibold mb-3">7.1 Free Trial</h3>
            <p className="mb-4">
              FlowDapt may offer a free trial period. After the trial, continued use requires a paid subscription.
            </p>

            <h3 className="text-xl font-semibold mb-3">7.2 Billing</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscription fees are billed in advance on a recurring basis</li>
              <li>You authorize us to charge your payment method automatically</li>
              <li>Prices are subject to change with 30 days' notice</li>
              <li>Refunds are provided according to our refund policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice, for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Extended period of inactivity</li>
            </ul>
            <p>
              You may terminate your account at any time through your account settings. Upon termination, your right to use the Services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-semibold mb-3">9.1 Service "As Is"</h3>
            <p className="mb-4">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold mb-3">9.2 Limitation of Liability</h3>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLOWDAPT SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, use, or goodwill</li>
              <li>Service interruptions or data loss</li>
              <li>Unauthorized access to your data</li>
              <li>Errors or inaccuracies in analytics results</li>
            </ul>
            <p className="mt-4">
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless FlowDapt, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Your use of the Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your uploaded data or content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Dispute Resolution</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these Terms or the Services shall be resolved through binding arbitration, except where prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Services. Your continued use after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> legal@flowdapt.com</li>
              <li><strong>Address:</strong> FlowDapt Inc., [Your Address]</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
            <p className="mb-4">
              <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.
            </p>
            <p className="mb-4">
              <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver.
            </p>
            <p>
              <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and FlowDapt regarding the Services.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
