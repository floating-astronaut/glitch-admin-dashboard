import clsx from 'clsx'

interface Props {
  className?: string
  width?: string | number
  height?: string | number
}

export default function Skeleton({ className, width, height }: Props) {
  return (
    <div
      className={clsx('bg-white/5 rounded animate-pulse', className)}
      style={{ width, height }}
    />
  )
}
