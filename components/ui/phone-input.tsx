"use client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { E164Number } from "libphonenumber-js/core";

type PhoneInputProps = React.ComponentProps<typeof PhoneInput>;

interface CustomPhoneInputProps extends Omit<PhoneInputProps, "onChange"> {
  onChange: (value: E164Number | undefined) => void;
}

export function CustomPhoneInput({
  value,
  onChange,
  ...props
}: CustomPhoneInputProps) {
  return (
    <div className="phone-input-container">
      <PhoneInput
        value={value}
        onChange={onChange}
        defaultCountry="AR"
        {...props}
        className="text-foreground"
      />
    </div>
  );
}
