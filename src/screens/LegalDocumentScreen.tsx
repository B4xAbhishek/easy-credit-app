import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { S } from '../theme/styles';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LegalDocument'>;

const PRIVACY_SECTIONS = [
  {
    title: '1. Introduction',
    body: 'This Privacy Policy explains how we collect, use, disclose, store, and protect personal data when you access or use the Platform. By using Easy Credit, you acknowledge that you have read and understood this policy.\n\nWe are committed to protecting your privacy in line with applicable laws in India, including the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (where applicable), and the Digital Personal Data Protection Act, 2023 (when applicable), and other regulations as may be updated from time to time.',
  },
  {
    title: '2. Scope',
    body: 'This policy applies to visitors, registered users, and applicants who interact with our services through the Platform. It does not apply to third-party websites or services that we do not control, even if linked from our Platform.',
  },
  {
    title: '3. Information we collect',
    body: 'Depending on how you use the Platform, we may collect the following categories of information:\n\nIdentity and contact details: name, phone number, email address, and other identifiers you provide during registration or verification.\nAuthentication data: one-time passwords (OTP), session tokens, and security-related logs when you sign in (e.g. via phone or third-party sign-in providers).\nLoan and product information: product selections, application details, order status, and related communications you submit through the Platform.\nPayment-related information: payment references, UPI transaction references, or other non-card payment metadata needed to reconcile payments. We do not store full payment instrument credentials on our servers where such storage is handled by regulated payment partners.\nTechnical and usage data: device type, browser or app version, IP address, approximate location derived from IP, cookies or similar technologies, and logs (e.g. crash reports, timestamps, pages viewed) to operate and secure the Platform.\nCommunications: messages you send to us (e.g. support requests) and records we maintain to resolve issues.',
  },
  {
    title: '4. How we use your information',
    body: 'We use personal data for purposes including:\n\ncreating and managing your account;\nprocessing applications, orders, and repayments;\nverifying identity and preventing fraud, abuse, or illegal activity;\ncommunicating with you about your account, products, and service updates;\ncomplying with legal and regulatory obligations;\nimproving the Platform, analytics, and user experience (including aggregated or de-identified statistics); and\nenforcing our Terms and Conditions and protecting our rights and users.',
  },
  {
    title: '5. Legal basis and consent',
    body: 'Where we rely on consent (for example, for certain marketing communications or optional cookies), you may withdraw consent at any time where withdrawal does not affect processing that is required by law or for the performance of a contract. Where we process data based on legitimate interests, we balance those interests against your rights and privacy.',
  },
  {
    title: '6. Sharing and disclosure',
    body: 'We may share information with:\n\nService providers and partners who assist us with hosting, authentication, messaging, analytics, customer support, or payment processing, subject to confidentiality and data-processing obligations.\nFinancial institutions, lenders, or partners where necessary to offer or fulfil loan products you request, subject to applicable agreements and law.\nRegulators, law enforcement, or courts when required by law, legal process, or to protect the rights, safety, and security of users and the public.\nCorporate transactions such as a merger, acquisition, or asset sale, with notice to you where required.\n\nWe do not sell your personal data in the conventional sense of selling lists to unknown third parties for their independent marketing.',
  },
  {
    title: '7. Data retention',
    body: 'We retain personal data only as long as necessary for the purposes described in this policy, including to satisfy legal, accounting, or reporting requirements. Retention periods may vary by data category and jurisdiction. When data is no longer needed, we delete or anonymise it in accordance with our internal policies.',
  },
  {
    title: '8. Security',
    body: 'We implement reasonable technical and organisational safeguards designed to protect personal data against unauthorised access, alteration, disclosure, or destruction. These include secure communications where appropriate, access controls, and monitoring. No method of transmission over the internet is completely secure; we cannot guarantee absolute security.',
  },
  {
    title: '9. Your rights',
    body: 'Subject to applicable law, you may have the right to request access, correction, or deletion of your personal data; to object to or restrict certain processing; to data portability where applicable; and to lodge a complaint with a supervisory authority. To exercise these rights, contact us using the channels described below. We may need to verify your identity before fulfilling requests.',
  },
  {
    title: '10. Cookies and similar technologies',
    body: 'We may use cookies, local storage, and similar technologies to remember preferences, maintain sessions, and understand how the Platform is used. You can control cookies through your browser settings; disabling certain cookies may affect functionality.',
  },
  {
    title: '11. Children',
    body: 'The Platform is not directed at individuals under 18 years of age (or the age of majority in your jurisdiction). We do not knowingly collect personal data from children. If you believe we have collected such data, please contact us and we will take appropriate steps to delete it.',
  },
  {
    title: '12. Cross-border transfers',
    body: 'Where personal data is transferred outside India, we ensure appropriate safeguards (such as contractual clauses or adequacy decisions) as required by applicable law.',
  },
  {
    title: '13. Changes to this policy',
    body: 'We may update this Privacy Policy from time to time. We will post the revised version on the Platform with an updated "Last updated" date. Material changes may be communicated through additional notice (e.g. in-app message or email) where appropriate. Continued use after changes constitutes acceptance of the updated policy, except where your consent is required under law.',
  },
  {
    title: '14. Grievance officer and contact',
    body: 'For privacy-related questions, requests, or complaints, you may contact our Grievance Officer through the contact details provided within the Platform or via the customer care channels listed in the app. We will endeavour to acknowledge and resolve grievances in line with applicable timelines under law.\n\nQuestions? Use Contact Us in the app or email supporteasycredit@gmail.com.',
  },
];

const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: 'These Terms and Conditions ("Terms") govern your access to and use of the Easy Credit Platform, including our website, applications, and related services (collectively, the "Services"). By creating an account, submitting an application, or otherwise using the Services, you agree to be bound by these Terms and our Privacy Policy.\n\nIf you do not agree, do not use the Services. We may modify these Terms from time to time; the "Last updated" date above reflects the current version. Continued use after changes constitutes acceptance, except where your explicit consent is required by law.',
  },
  {
    title: '2. About Easy Credit',
    body: 'Easy Credit provides a digital platform to discover, apply for, and manage loan products and related offerings made available through partner financial institutions or lenders, as described on the Platform. The specific terms of any loan (including amount, tenure, interest rate, fees, and repayment schedule) are governed by separate loan documentation or agreements with the relevant lender, where applicable.\n\nNothing on the Platform constitutes financial, legal, or tax advice. You should read all product disclosures and consult independent professionals as needed before entering into a financial commitment.',
  },
  {
    title: '3. Eligibility',
    body: 'You must be at least 18 years of age (or the age of majority in your jurisdiction) and capable of entering into a binding contract. You represent that the information you provide is accurate, complete, and current. We may refuse or suspend access if we reasonably believe eligibility requirements are not met or if required by law or partner policies.',
  },
  {
    title: '4. Your account',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must notify us immediately of any unauthorised use. We may use phone-based OTP, email verification, or third-party identity providers (e.g. Google Sign-In) as part of authentication; your use of those services is also subject to their respective terms.',
  },
  {
    title: '5. Products, offers, and credit decisions',
    body: 'Product availability, pricing, eligibility, and approval are subject to internal policies, partner lender criteria, and applicable law. Display of loan options or amounts does not guarantee approval or disbursement. We and our partners may request additional documents or information at any stage. We reserve the right to decline, withdraw, or modify offers without prior notice except where prohibited by law.',
  },
  {
    title: '6. Fees, charges, and taxes',
    body: 'You agree to pay all fees, interest, processing charges, and applicable taxes as disclosed at the time of acceptance of a loan or service and in your loan agreement. Late payment or default may attract additional charges and reporting to credit bureaus as permitted by law.',
  },
  {
    title: '7. Payments',
    body: 'Payment instructions (including UPI, bank transfer, or other methods) may be displayed on the Platform. You must use only authorised channels and retain transaction references for your records. We are not responsible for delays or failures caused by banks, payment networks, or incorrect information submitted by you.',
  },
  {
    title: '8. Prohibited conduct',
    body: 'You agree not to:\n\nuse the Services for any unlawful purpose or in violation of these Terms;\nimpersonate or misrepresent your identity or affiliation;\nattempt to gain unauthorised access to systems, data, or other users\' accounts;\nintroduce malware, scrape or overload the Platform, or circumvent security measures;\nuse the Services to transmit spam, abusive content, or harmful material;\nreverse engineer or copy the Platform except as permitted by law.',
  },
  {
    title: '9. Intellectual property',
    body: 'The Platform, including its design, text, graphics, logos, and software, is owned by Easy Credit or its licensors and is protected by intellectual property laws. You receive a limited, non-exclusive, non-transferable licence to use the Services for personal, non-commercial purposes in accordance with these Terms. No rights are granted except as expressly stated.',
  },
  {
    title: '10. Disclaimer of warranties',
    body: 'THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, TO THE MAXIMUM EXTENT PERMITTED BY LAW. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.',
  },
  {
    title: '11. Limitation of liability',
    body: 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, EASY CREDIT AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.\n\nOUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN FEES SPECIFICALLY FOR THE PLATFORM SERVICES IN THE THREE (3) MONTHS PRECEDING THE CLAIM, OR (B) INDIAN RUPEES FIVE THOUSAND (Rs. 5,000), EXCEPT WHERE PROHIBITED BY LAW.',
  },
  {
    title: '12. Indemnity',
    body: 'You agree to indemnify, defend, and hold harmless Easy Credit and its affiliates from any claims, losses, damages, liabilities, and expenses (including reasonable legal fees) arising from your use of the Services, your violation of these Terms, or your violation of any third-party rights.',
  },
  {
    title: '13. Suspension and termination',
    body: 'We may suspend or terminate your access to the Services at any time for breach of these Terms, legal or regulatory requirements, risk management, or operational reasons. You may stop using the Services at any time. Provisions that by their nature should survive (including intellectual property, disclaimers, limitation of liability, and indemnity) will survive termination.',
  },
  {
    title: '14. Governing law and jurisdiction',
    body: 'These Terms are governed by the laws of India. Subject to applicable law, you agree that courts at Bangalore, Karnataka, India (or such other venue we may specify in writing) shall have exclusive jurisdiction over disputes arising from or relating to these Terms or the Services, unless a different mandatory forum applies to you as a consumer.',
  },
  {
    title: '15. Dispute resolution',
    body: 'Before initiating any dispute, you agree to contact us through customer support channels on the Platform to attempt resolution in good faith. If the dispute cannot be resolved within a reasonable period, either party may pursue remedies available under law.',
  },
  {
    title: '16. Miscellaneous',
    body: 'This document constitutes the entire agreement between you and Easy Credit regarding the subject matter hereof and supersedes prior understandings. If any provision is held invalid, the remainder remains in effect. Failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them in connection with a merger or sale of assets.\n\nQuestions? Use Contact Us in the app or email supporteasycredit@gmail.com.',
  },
];

export function LegalDocumentScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const isPrivacy = route.params.type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
    <View style={S.screenRoot}>
      <View style={[S.screenHeader, { paddingTop: insets.top + 10 }]}>
        <View style={S.contactHeaderRow}>
          <Pressable style={S.contactBackBtn} onPress={() => navigation.goBack()}>
            <Text style={S.contactBackBtnText}>‹</Text>
          </Pressable>
          <Text style={S.contactHeaderTitle}>{title}</Text>
          <View style={S.w40} />
        </View>
        <Text style={S.screenHeaderSub}>Please read this document carefully.</Text>
      </View>

      <ScrollView contentContainerStyle={S.legalContent}>
        <Text style={S.legalIntro}>
          {isPrivacy
            ? 'Last updated: 8 April 2026\n\nEasy Credit ("we", "us", or "our") respects your privacy. This Privacy Policy describes how we handle personal data when you use our website and related services (the "Platform"). Read it together with our Terms & Conditions.'
            : 'Last updated: 8 April 2026\n\nThese Terms and Conditions ("Terms") form a binding agreement between you and Easy Credit regarding use of the Easy Credit Platform. Please read them together with our Privacy Policy.'}
        </Text>
        {sections.map(section => (
          <View key={section.title} style={S.legalSection}>
            <Text style={S.legalSectionTitle}>{section.title}</Text>
            <Text style={S.legalSectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
