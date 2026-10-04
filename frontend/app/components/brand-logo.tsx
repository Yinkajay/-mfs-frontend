import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  preload?: boolean;
  variant?: "solid" | "transparent";
};

export function BrandLogo({
  className = "h-8 w-auto",
  preload = false,
  variant = "transparent",
}: BrandLogoProps) {
  return (
    <Image
      src={variant === "solid" ? "/mfs-logo-solid.png" : "/mfs-logo-transparent.png"}
      alt="MFS Services"
      width={783}
      height={179}
      className={className}
      preload={preload}
    />
  );
}
