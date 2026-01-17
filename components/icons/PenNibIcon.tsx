import { PenTool } from 'lucide-react'

interface PenNibIconProps {
  className?: string
}

export function PenNibIcon({ className = '' }: PenNibIconProps) {
  return <PenTool className={className} />
}
