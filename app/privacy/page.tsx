import type { Metadata } from "next";
import { LegalPage } from "@/app/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How MFS Services handles customer and vehicle information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy policy"
      title="Your information supports your service request."
      intro="This policy explains the information MFS Services may receive when you contact us and how it is used to support vehicle documentation and related services."
    >
      <section>
        <h2>Information you choose to provide</h2>
        <p>
          When you call or start a WhatsApp chat, you may provide your name, phone
          number, vehicle details, identity documents and other records required for
          the service you request.
        </p>
      </section>

      <section>
        <h2>How we use information</h2>
        <p>
          MFS uses relevant information to respond to enquiries, confirm service
          requirements, process authorized requests, arrange delivery, send renewal
          reminders and maintain appropriate business records.
        </p>
      </section>

      <section>
        <h2>When information is shared</h2>
        <p>
          Information may be shared with government agencies, insurers, delivery
          providers and service partners when this is necessary to complete your
          request or meet a legal obligation. MFS does not sell customer information.
        </p>
      </section>

      <section>
        <h2>Storage and security</h2>
        <p>
          MFS keeps information only for as long as it is reasonably needed for the
          service, record keeping and applicable legal requirements. Reasonable
          administrative and technical safeguards are used to protect it.
        </p>
      </section>

      <section>
        <h2>WhatsApp and external services</h2>
        <p>
          WhatsApp, maps and social platforms operate under their own privacy terms.
          Information sent through those services may also be handled by the service
          provider according to its policies.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask what personal information MFS holds about you, request a
          correction or ask that information no longer needed be deleted, subject to
          legal and operational record requirements.
        </p>
      </section>
    </LegalPage>
  );
}
