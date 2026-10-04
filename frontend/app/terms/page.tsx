import type { Metadata } from "next";
import { LegalPage } from "@/app/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "General terms for services provided by MFS Services.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of service"
      title="Clear expectations for every service request."
      intro="These terms describe the general basis on which MFS Services handles vehicle documentation, insurance support and related requests."
    >
      <section>
        <h2>Service scope</h2>
        <p>
          MFS helps customers prepare and process vehicle registration, renewals,
          permits, insurance and related documentation. The exact service scope is
          confirmed with you before processing begins.
        </p>
      </section>

      <section>
        <h2>Quotes and payments</h2>
        <p>
          Prices depend on the vehicle, document type, applicable agency fees and
          delivery location. A quote is based on the information available when it
          is issued and may change if requirements or official fees change.
        </p>
      </section>

      <section>
        <h2>Customer responsibilities</h2>
        <p>
          You are responsible for providing accurate, complete and authentic
          information. Delays or added costs caused by missing or incorrect details
          may affect the original estimate or delivery timeline.
        </p>
      </section>

      <section>
        <h2>Timelines and delivery</h2>
        <p>
          MFS will communicate the expected timeline for your request and keep you
          informed of material changes. Agency processing, verification and events
          outside the control of MFS may affect completion dates.
        </p>
      </section>

      <section>
        <h2>Agency and insurer decisions</h2>
        <p>
          Government agencies and insurance providers make their own approval and
          issuance decisions. MFS coordinates the process but cannot override a
          lawful refusal or a request for additional documentation.
        </p>
      </section>

      <section>
        <h2>Questions and changes</h2>
        <p>
          Contact MFS before payment if any requirement is unclear. These terms may
          be updated when services, regulations or business practices change.
        </p>
      </section>
    </LegalPage>
  );
}
