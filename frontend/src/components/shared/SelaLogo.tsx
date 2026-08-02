import React from "react";
import selaLogoSvg from "@/assets/svg/sela-logo.svg?raw";
import logoLoginSvg from "@/assets/svg/logo-login.svg?raw";

interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "login";
  className?: string;
}

export const SelaLogo: React.FC<LogoProps> = ({
  variant = "default",
  className = "",
  ...props
}) => {
  const svgContent = variant === "login" ? logoLoginSvg : selaLogoSvg;

  return (
    <span
      className={`inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};

export const LogoLogin: React.FC<Omit<LogoProps, "variant">> = (props) => (
  <SelaLogo variant="login" {...props} />
);

export default SelaLogo;
