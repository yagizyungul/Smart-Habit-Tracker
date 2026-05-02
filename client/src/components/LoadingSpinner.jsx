export default function LoadingSpinner({ fullScreen = false }) {
  const spinner = (
    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E3DBA9] border-t-[#0B735F]" />
  )

  if (fullScreen) {
    return (
      <div className="botanic-bg flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  )
}
