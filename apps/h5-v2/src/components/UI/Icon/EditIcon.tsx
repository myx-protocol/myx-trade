import type { SVGProps } from 'react'

export interface EditIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const EditIcon = ({ size = 12, color = 'white', width, height, ...props }: EditIconProps) => {
  const iconWidth = width || size
  const iconHeight = height || size

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0.690409 11.2484C0.447581 11.2484 0.25 11.0509 0.25 10.808V8.4032C0.25 8.28562 0.295873 8.17509 0.379007 8.09179L7.59339 0.8773C7.67653 0.794164 7.78722 0.748291 7.9048 0.748291C8.02237 0.748291 8.13306 0.794008 8.2162 0.8773L10.621 3.28213C10.7927 3.45388 10.7927 3.73319 10.621 3.90494L3.40661 11.1194C3.32347 11.2026 3.21278 11.2484 3.0952 11.2484H0.690409ZM1.13098 8.58544V10.3675H2.91297L7.95004 5.33031L6.16805 3.54829L1.13098 8.58544ZM6.79086 2.92548L8.57285 4.70749L9.68679 3.59354L7.9048 1.81152L6.79086 2.92548Z"
        fill={color}
      />
      <path
        d="M5.5 11.2484C5.25717 11.2484 5.05959 11.0509 5.05959 10.808C5.05959 10.5652 5.25717 10.3676 5.5 10.3676H10.3096C10.5524 10.3676 10.75 10.5652 10.75 10.808C10.75 11.0509 10.5524 11.2484 10.3096 11.2484H5.5Z"
        fill={color}
      />
    </svg>
  )
}

export default EditIcon
