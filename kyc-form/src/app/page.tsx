"use client";

import { FormEvent, useState } from "react";

type StepId = "personal" | "address" | "identity" | "review";

type FormData = {
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  nationality: string;
  occupation: string;
  sourceOfFunds: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  residenceStatus: string;
  idType: "passport" | "drivers_license" | "national_id";
  idNumber: string;
  idIssueDate: string;
  idExpiryDate: string;
  documentFile: File | null;
  proofOfAddressFile: File | null;
  politicallyExposed: "no" | "yes" | "former";
  termsAccepted: boolean;
  marketingOptIn: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormState: FormData = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  nationality: "",
  occupation: "",
  sourceOfFunds: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  residenceStatus: "",
  idType: "passport",
  idNumber: "",
  idIssueDate: "",
  idExpiryDate: "",
  documentFile: null,
  proofOfAddressFile: null,
  politicallyExposed: "no",
  termsAccepted: false,
  marketingOptIn: false,
};

const steps: { id: StepId; title: string; description: string }[] = [
  {
    id: "personal",
    title: "Personal Details",
    description: "Provide your basic identity information so we know who you are.",
  },
  {
    id: "address",
    title: "Residential Address",
    description: "Tell us where you live to verify residency and risk requirements.",
  },
  {
    id: "identity",
    title: "Identity Documents",
    description: "Upload official documentation to verify your identity.",
  },
  {
    id: "review",
    title: "Review & Consent",
    description: "Confirm everything looks correct and submit your application.",
  },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+()[\]\s-]{7,20}$/;

function calculateAge(value: string): number | null {
  if (!value) return null;
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function validateStep(step: StepId, data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (step === "personal") {
    if (!data.firstName.trim()) errors.firstName = "First name is required.";
    if (!data.lastName.trim()) errors.lastName = "Last name is required.";
    if (!data.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else {
      const age = calculateAge(data.dateOfBirth);
      if (age === null) {
        errors.dateOfBirth = "Enter a valid date of birth.";
      } else if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old.";
      }
    }
    if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!data.phone.trim() || !phoneRegex.test(data.phone.trim())) {
      errors.phone = "Enter a valid phone number.";
    }
    if (!data.nationality.trim()) {
      errors.nationality = "Nationality is required.";
    }
    if (!data.occupation.trim()) {
      errors.occupation = "Occupation is required.";
    }
    if (!data.sourceOfFunds.trim()) {
      errors.sourceOfFunds = "Source of funds is required.";
    }
  }

  if (step === "address") {
    if (!data.addressLine1.trim()) errors.addressLine1 = "Address line 1 is required.";
    if (!data.city.trim()) errors.city = "City is required.";
    if (!data.state.trim()) errors.state = "State or province is required.";
    if (!data.postalCode.trim()) errors.postalCode = "Postal code is required.";
    if (!data.country.trim()) errors.country = "Country is required.";
    if (!data.residenceStatus.trim()) errors.residenceStatus = "Residence status is required.";
  }

  if (step === "identity") {
    if (!data.idNumber.trim()) errors.idNumber = "Identification number is required.";
    if (!data.idIssueDate) {
      errors.idIssueDate = "Document issue date is required.";
    } else {
      const issueDate = new Date(data.idIssueDate);
      if (Number.isNaN(issueDate.getTime())) {
        errors.idIssueDate = "Enter a valid issue date.";
      } else if (issueDate > new Date()) {
        errors.idIssueDate = "Issue date cannot be in the future.";
      }
    }
    if (!data.idExpiryDate) {
      errors.idExpiryDate = "Document expiry date is required.";
    } else {
      const expiryDate = new Date(data.idExpiryDate);
      const issueDate = data.idIssueDate ? new Date(data.idIssueDate) : null;
      if (Number.isNaN(expiryDate.getTime())) {
        errors.idExpiryDate = "Enter a valid expiry date.";
      } else if (issueDate && Number.isNaN(issueDate.getTime())) {
        errors.idExpiryDate = "Enter a valid issue date.";
      } else if (issueDate && expiryDate <= issueDate) {
        errors.idExpiryDate = "Expiry date must be after issue date.";
      }
    }
    if (!data.documentFile) {
      errors.documentFile = "Please upload an identification document.";
    }
    if (!data.proofOfAddressFile) {
      errors.proofOfAddressFile = "Proof of address document is required.";
    }
  }

  if (step === "review") {
    if (!data.termsAccepted) {
      errors.termsAccepted = "You must accept the terms to proceed.";
    }
  }

  return errors;
}

const summaryLabels: Record<keyof FormData, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  middleName: "Middle Name",
  dateOfBirth: "Date of Birth",
  email: "Email",
  phone: "Phone",
  nationality: "Nationality",
  occupation: "Occupation",
  sourceOfFunds: "Source of Funds",
  addressLine1: "Address Line 1",
  addressLine2: "Address Line 2",
  city: "City",
  state: "State / Province",
  postalCode: "Postal Code",
  country: "Country",
  residenceStatus: "Residence Status",
  idType: "Identification Type",
  idNumber: "Identification Number",
  idIssueDate: "Issue Date",
  idExpiryDate: "Expiry Date",
  documentFile: "Identity Document",
  proofOfAddressFile: "Proof of Address",
  politicallyExposed: "Politically Exposed",
  termsAccepted: "Terms Accepted",
  marketingOptIn: "Marketing Opt-in",
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const completionRatio =
    totalSteps > 1
      ? submitted
        ? 100
        : (currentStepIndex / (totalSteps - 1)) * 100
      : 0;

  const handleFieldChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const goNext = () => {
    const validation = validateStep(currentStep.id, formData);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const goBack = () => {
    setErrors({});
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateStep("review", formData);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitting(false);
    setSubmitted(true);
    setConfirmationId(`KYC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  };

  const resetApplication = () => {
    setFormData(initialFormState);
    setErrors({});
    setCurrentStepIndex(0);
    setSubmitted(false);
    setConfirmationId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1 text-sm font-medium tracking-wide text-emerald-300">
            Secure KYC Onboarding
          </div>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Verify your identity in a few guided steps
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Complete this know-your-customer (KYC) profile to unlock higher account limits.
            We use bank-grade encryption and only request information required by regulation.
          </p>
        </header>

        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{currentStep.title}</h2>
                <p className="text-sm text-slate-400">{currentStep.description}</p>
              </div>
              <div className="text-sm text-slate-400">
                Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(completionRatio, 100)}%` }}
              />
            </div>

            <ol className="grid gap-2 text-xs font-medium text-slate-500 sm:grid-cols-4">
              {steps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isComplete = submitted || index < currentStepIndex;
                return (
                  <li
                    key={step.id}
                    className={`rounded-xl border px-3 py-2 transition ${
                      isActive
                        ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200"
                        : isComplete
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="uppercase tracking-wider">{index + 1}</span>
                      {isComplete ? (
                        <span className="text-emerald-300">Complete</span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white">{step.title}</div>
                  </li>
                );
              })}
            </ol>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {currentStep.id === "personal" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <InputField
                  label="First name"
                  value={formData.firstName}
                  onChange={(value) => handleFieldChange("firstName", value)}
                  error={errors.firstName}
                  required
                />
                <InputField
                  label="Last name"
                  value={formData.lastName}
                  onChange={(value) => handleFieldChange("lastName", value)}
                  error={errors.lastName}
                  required
                />
                <InputField
                  label="Middle name"
                  value={formData.middleName}
                  onChange={(value) => handleFieldChange("middleName", value)}
                />
                <InputField
                  label="Date of birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(value) => handleFieldChange("dateOfBirth", value)}
                  error={errors.dateOfBirth}
                  required
                />
                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleFieldChange("email", value)}
                  error={errors.email}
                  required
                />
                <InputField
                  label="Phone number"
                  type="tel"
                  value={formData.phone}
                  onChange={(value) => handleFieldChange("phone", value)}
                  error={errors.phone}
                  helperText="Include country code if outside your home country."
                  required
                />
                <InputField
                  label="Nationality"
                  value={formData.nationality}
                  onChange={(value) => handleFieldChange("nationality", value)}
                  error={errors.nationality}
                  required
                />
                <InputField
                  label="Occupation"
                  value={formData.occupation}
                  onChange={(value) => handleFieldChange("occupation", value)}
                  error={errors.occupation}
                  required
                />
                <div className="lg:col-span-2">
                  <InputField
                    label="Source of funds"
                    value={formData.sourceOfFunds}
                    onChange={(value) => handleFieldChange("sourceOfFunds", value)}
                    error={errors.sourceOfFunds}
                    required
                    placeholder="e.g. Salary, investments, or business income"
                  />
                </div>
              </div>
            )}

            {currentStep.id === "address" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <InputField
                  label="Address line 1"
                  value={formData.addressLine1}
                  onChange={(value) => handleFieldChange("addressLine1", value)}
                  error={errors.addressLine1}
                  required
                />
                <InputField
                  label="Address line 2"
                  value={formData.addressLine2}
                  onChange={(value) => handleFieldChange("addressLine2", value)}
                  helperText="Apartment, suite, unit, building, floor"
                />
                <InputField
                  label="City"
                  value={formData.city}
                  onChange={(value) => handleFieldChange("city", value)}
                  error={errors.city}
                  required
                />
                <InputField
                  label="State / Province"
                  value={formData.state}
                  onChange={(value) => handleFieldChange("state", value)}
                  error={errors.state}
                  required
                />
                <InputField
                  label="Postal code"
                  value={formData.postalCode}
                  onChange={(value) => handleFieldChange("postalCode", value)}
                  error={errors.postalCode}
                  required
                />
                <InputField
                  label="Country"
                  value={formData.country}
                  onChange={(value) => handleFieldChange("country", value)}
                  error={errors.country}
                  required
                />
                <div className="lg:col-span-2">
                  <SelectField
                    label="Residence status"
                    value={formData.residenceStatus}
                    onChange={(value) => handleFieldChange("residenceStatus", value)}
                    options={[
                      { label: "Select status", value: "" },
                      { label: "Citizen", value: "citizen" },
                      { label: "Permanent resident", value: "permanent_resident" },
                      { label: "Temporary resident", value: "temporary_resident" },
                      { label: "Student visa", value: "student_visa" },
                      { label: "Work permit", value: "work_permit" },
                    ]}
                    error={errors.residenceStatus}
                    required
                  />
                </div>
              </div>
            )}

            {currentStep.id === "identity" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <SelectField
                  label="Identification type"
                  value={formData.idType}
                  onChange={(value) => handleFieldChange("idType", value as FormData["idType"])}
                  options={[
                    { label: "Passport", value: "passport" },
                    { label: "Driver's license", value: "drivers_license" },
                    { label: "National ID card", value: "national_id" },
                  ]}
                  required
                />
                <InputField
                  label="Identification number"
                  value={formData.idNumber}
                  onChange={(value) => handleFieldChange("idNumber", value)}
                  error={errors.idNumber}
                  required
                />
                <InputField
                  label="Issue date"
                  type="date"
                  value={formData.idIssueDate}
                  onChange={(value) => handleFieldChange("idIssueDate", value)}
                  error={errors.idIssueDate}
                  required
                />
                <InputField
                  label="Expiry date"
                  type="date"
                  value={formData.idExpiryDate}
                  onChange={(value) => handleFieldChange("idExpiryDate", value)}
                  error={errors.idExpiryDate}
                  required
                />
                <FileField
                  label="Government-issued ID (PDF, JPG, PNG)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleFieldChange("documentFile", file)}
                  file={formData.documentFile}
                  error={errors.documentFile}
                  required
                />
                <FileField
                  label="Proof of address (utility bill, bank statement)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleFieldChange("proofOfAddressFile", file)}
                  file={formData.proofOfAddressFile}
                  error={errors.proofOfAddressFile}
                  required
                />
                <SelectField
                  label="Are you a politically exposed person (PEP)?"
                  value={formData.politicallyExposed}
                  onChange={(value) =>
                    handleFieldChange("politicallyExposed", value as FormData["politicallyExposed"])
                  }
                  options={[
                    { label: "No", value: "no" },
                    { label: "Yes", value: "yes" },
                    { label: "Formerly", value: "former" },
                  ]}
                  helperText="Politically exposed persons hold or have held public office."
                />
              </div>
            )}

            {currentStep.id === "review" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <h3 className="text-lg font-semibold text-white">Summary</h3>
                  <p className="text-sm text-slate-400">
                    Review your answers below. You can go back to make edits before submission.
                  </p>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    {(Object.keys(summaryLabels) as (keyof FormData)[])
                      .filter((field) => !["termsAccepted", "marketingOptIn"].includes(field))
                      .map((field) => {
                        const value = formData[field];
                        if (!value) {
                          return null;
                        }
                        const formattedValue =
                          value instanceof File
                            ? value.name
                            : typeof value === "boolean"
                              ? value
                                ? "Yes"
                                : "No"
                              : value;
                        if (!formattedValue) return null;
                        return (
                          <div
                            key={field}
                            className="flex flex-col rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2"
                          >
                            <span className="text-xs uppercase tracking-wide text-slate-500">
                              {summaryLabels[field]}
                            </span>
                            <span className="font-medium text-white">{formattedValue}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  <p className="font-medium text-emerald-200">Your documents are encrypted at rest.</p>
                  <p>
                    We only retain them for regulatory compliance and delete them once the retention
                    period has passed.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(event) => handleFieldChange("termsAccepted", event.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400"
                    />
                    <span>
                      I certify that the information provided is true and understand that the company
                      may use third-party services to verify my identity.
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-sm text-rose-400">{errors.termsAccepted}</p>
                  )}

                  <label className="flex items-start gap-3 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      checked={formData.marketingOptIn}
                      onChange={(event) => handleFieldChange("marketingOptIn", event.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400"
                    />
                    <span>Keep me informed about product updates and onboarding tips (optional).</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex gap-3">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-full border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Back
                  </button>
                )}
                {currentStep.id !== "review" && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring focus:ring-emerald-400/40"
                  >
                    Continue
                  </button>
                )}
              </div>
              {currentStep.id === "review" && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <span className="h-2 w-2 animate-ping rounded-full bg-slate-950" />
                      Verifying…
                    </>
                  ) : (
                    "Submit verification"
                  )}
                </button>
              )}
            </div>
          </form>

          {submitted && (
            <div className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-200">Application received</h3>
              <p>
                Thank you! Your verification request has been submitted. We&apos;ll notify you within
                1–2 business days.
              </p>
              {confirmationId && (
                <p className="font-mono text-emerald-300">Reference ID: {confirmationId}</p>
              )}
              <button
                type="button"
                onClick={resetApplication}
                className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
              >
                Start a new application
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

function InputField({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  type = "text",
  required,
}: InputFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
      <span>
        {label}
        {required && <span className="ml-1 text-emerald-300">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-slate-100 shadow-inner shadow-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 ${
          error ? "border-rose-400/70 focus:ring-rose-400/40" : "border-slate-800"
        }`}
      />
      {helperText && !error && <span className="text-xs text-slate-400">{helperText}</span>}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  helperText?: string;
  error?: string;
  required?: boolean;
};

function SelectField({
  label,
  value,
  onChange,
  options,
  helperText,
  error,
  required,
}: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
      <span>
        {label}
        {required && <span className="ml-1 text-emerald-300">*</span>}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-slate-100 shadow-inner shadow-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 ${
          error ? "border-rose-400/70 focus:ring-rose-400/40" : "border-slate-800"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && <span className="text-xs text-slate-400">{helperText}</span>}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}

type FileFieldProps = {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
};

function FileField({ label, accept, file, onChange, error, required }: FileFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
      <span>
        {label}
        {required && <span className="ml-1 text-emerald-300">*</span>}
      </span>
      <div
        className={`flex flex-col gap-2 rounded-xl border border-dashed bg-slate-950/60 p-4 text-slate-300 transition ${
          error ? "border-rose-400/70" : "border-slate-800 hover:border-emerald-400/60"
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] ?? null;
            onChange(selectedFile);
          }}
          className="text-xs text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-400"
        />
        {file && <span className="truncate text-xs text-emerald-200">{file.name}</span>}
      </div>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}
