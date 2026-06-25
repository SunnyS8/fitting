import { ArrowRight, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompareSlider } from "@/components/compare-slider"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI-примерка нового поколения
          </span>

          <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
            Примерьте любую одежду, не вставая с дивана
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
            Загрузите одно фото — и наш искусственный интеллект реалистично наденет на вас любой
            образ за считанные секунды. Никаких примерочных и возвратов.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="group" asChild>
              <a href="#try-on">
                <Upload className="size-4" />
                Загрузить фото
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#showcase">Смотреть примеры</a>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <div>
              <p className="font-heading text-2xl font-semibold">2 млн+</p>
              <p className="text-sm text-muted-foreground">примерок</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-heading text-2xl font-semibold">−42%</p>
              <p className="text-sm text-muted-foreground">возвратов</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-heading text-2xl font-semibold">4.9/5</p>
              <p className="text-sm text-muted-foreground">оценка</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" aria-hidden />
          <CompareSlider
            beforeSrc="/images/tryon-before.png"
            afterSrc="/images/tryon-after.png"
            beforeAlt="Девушка в базовой одежде до AI-примерки"
            afterAlt="Девушка в стильном образе после AI-примерки"
          />
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Потяните ползунок, чтобы увидеть результат
          </p>
        </div>
      </div>
    </section>
  )
}
