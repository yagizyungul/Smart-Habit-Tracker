export default function LoadingSpinner({ fullScreen = false }) {
  const spinner = (
    <div className="animate-spin rounded-full h-9 w-9 border-[3px] border-gray-200 border-t-[#534AB7]" />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
