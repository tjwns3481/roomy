import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-sand">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-secondary">
          Roomy
        </h1>
        <p className="text-lg text-secondary/70">
          에어비앤비 호스트를 위한 디지털 숙소 안내서
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            시작하기
          </Link>
          <Link
            href="/g/demo"
            className="px-6 py-3 border border-secondary/20 text-secondary rounded-lg hover:bg-secondary/5 transition-colors"
          >
            데모 보기
          </Link>
        </div>
      </div>
    </main>
  )
}
