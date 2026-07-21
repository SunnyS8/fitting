import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Условия использования — Atelier AI",
  description: "Условия использования сервиса Atelier AI",
}

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← На главную
        </Link>

        <h1 className="mt-8 font-heading text-3xl font-semibold tracking-tight">
          Условия использования
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Последнее обновление: 21 июля 2026 г.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">1. Описание сервиса</h2>
            <p>
              Atelier AI — это сервис виртуальной примерки одежды на основе искусственного интеллекта. Сервис позволяет загрузить фотографию и получить изображение с примеркой выбранной одежды.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">2. Регистрация и аккаунт</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Для использования сервиса необходима авторизация через Google OAuth.</li>
              <li>Вы несёте ответственность за безопасность своего аккаунта.</li>
              <li>Один аккаунт — одно лицо. Запрещено создавать множественные аккаунты для обхода лимитов.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">3. Кредиты и оплата</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Каждая AI-примерка стоит 25 кредитов.</li>
              <li>Кредиты приобретаются пакетами или через подписку.</li>
              <li>Кредиты не подлежат возврату, за исключением случаев, описанных в разделе «Возвраты».</li>
              <li>Бесплатные кредиты при регистрации — 75 кредитов (3 примерки).</li>
              <li>Неиспользованные кредиты не переносятся на следующий месяц при подписке.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">4. Подписки</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Подписка автоматически продлевается каждый месяц.</li>
              <li>Вы можете отменить подписку в любой момент — доступ сохранится до конца оплаченного периода.</li>
              <li>При отмене подписки неиспользованные кредиты текущего месяца не возвращаются.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">5. Возвраты</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Возврат пакетов кредитов возможен в течение 14 дней с момента покупки, если кредиты не были использованы.</li>
              <li>Возврат подписки возможен в течение 14 дней с момента оплаты, если ни одна генерация не была выполнена.</li>
              <li>Для возврата свяжитесь с нами по email: support@atelier-ai.ru</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">6. Использование сервиса</h2>
            <p>Вы соглашаетесь не:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Использовать сервис для генерации незаконного, оскорбительного или порнографического контента</li>
              <li>Пытаться обойти систему кредитов или лимиты</li>
              <li>Использовать автоматизированные средства (боты, скрипты) для доступа к сервису</li>
              <li>Передавать доступ к аккаунту третьим лицам</li>
              <li>Нарушать работу серверов или инфраструктуры сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">7. Интеллектуальная собственность</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Вы сохраняете права на загруженные фотографии.</li>
              <li>Сгенерированные изображения принадлежат вам.</li>
              <li>Мы не используем ваши фотографии для обучения моделей без вашего явного согласия.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">8. Ограничение ответственности</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Сервис предоставляется «как есть». Мы не гарантируем точность или реалистичность результатов.</li>
              <li>Мы не несём ответственности за решения, принятые на основе сгенерированных изображений.</li>
              <li>Максимальная ответственность не превышает суммы, оплаченной вами за последние 3 месяца.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">9. Изменения условий</h2>
            <p>
              Мы можем изменять эти условия. При существенных изменениях мы уведомим вас по email. Продолжая использование сервиса после изменений, вы принимаете обновлённые условия.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">10. Контакты</h2>
            <p>
              По вопросам использования сервиса:<br />
              Email: support@atelier-ai.ru
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}
