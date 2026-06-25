import { Plus } from "lucide-react"

const faqs = [
  {
    q: "Насколько реалистичен результат?",
    a: "Наш AI учитывает позу, освещение и пропорции фигуры, поэтому одежда выглядит так, будто вы действительно её надели. Складки, тени и текстуры ткани сохраняются.",
  },
  {
    q: "Какие фото подходят лучше всего?",
    a: "Подойдёт любое чёткое фото в полный рост при хорошем освещении. Желательно, чтобы вы стояли прямо, а одежда не была слишком объёмной.",
  },
  {
    q: "Что с конфиденциальностью моих фото?",
    a: "Все изображения шифруются при загрузке и автоматически удаляются после обработки или по вашему запросу. Мы не передаём данные третьим сторонам.",
  },
  {
    q: "Можно ли интегрировать примерку в мой магазин?",
    a: "Да. На тарифе «Бизнес» доступны API и готовый виджет, который встраивается в карточку товара за несколько минут.",
  },
]

export function Faq() {
  return (
    <section className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Частые вопросы
          </h2>
        </div>

        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((faq) => (
            <details key={faq.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-medium">
                {faq.q}
                <Plus className="size-5 shrink-0 text-primary transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
