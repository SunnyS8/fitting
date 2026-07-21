import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Atelier AI",
  description: "Политика обработки персональных данных сервиса Atelier AI",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← На главную
        </Link>

        <h1 className="mt-8 font-heading text-3xl font-semibold tracking-tight">
          Политика конфиденциальности
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Последнее обновление: 21 июля 2026 г.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">1. Какие данные мы собираем</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-foreground">Фотографии</strong> — загруженные вами изображения для AI-примерки. Фото обрабатываются и удаляются из системы в течение 24 часов после обработки.</li>
              <li><strong className="text-foreground">Email-адрес</strong> — через Google OAuth для авторизации и связи с вами.</li>
              <li><strong className="text-foreground">Данные платежей</strong> — обрабатываются через платёжную систему ЮKassa. Мы не храним номера банковских карт.</li>
              <li><strong className="text-foreground">История примерок</strong> — результаты сгенерированных изображений хранятся в вашем аккаунте до удаления.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">2. Как мы используем данные</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Для предоставления услуги AI-примерки одежды</li>
              <li>Для обработки платежей и управления подпиской</li>
              <li>Для связи с вами по вопросам поддержки</li>
              <li>Для улучшения качества сервиса (анонимная аналитика)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">3. Хранение и защита данных</h2>
            <p>
              Все данные хранятся на защищённых серверах в Европейском союзе. Мы используем шифрование TLS для передачи данных и AES-256 для хранения. Фотографии автоматически удаляются из системы обработки в течение 24 часов.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">4. Ваши права (GDPR)</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-foreground">Получить доступ</strong> к вашим персональным данным</li>
              <li><strong className="text-foreground">Исправить</strong> неточные данные</li>
              <li><strong className="text-foreground">Удалить</strong> свой аккаунт и все связанные данные</li>
              <li><strong className="text-foreground">Экспортировать</strong> данные в машиночитаемом формате</li>
              <li><strong className="text-foreground">Отозвать согласие</strong> на обработку данных</li>
            </ul>
            <p className="mt-2">
              Для реализации этих прав напишите нам на privacy@atelier-ai.ru или используйте функцию удаления аккаунта в настройках.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">5. Передача данных третьим лицам</h2>
            <p>
              Мы передаём данные только тем третьим лицам, которые необходимы для работы сервиса:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-foreground">Google</strong> — для авторизации (OAuth)</li>
              <li><strong className="text-foreground">ЮKassa</strong> — для обработки платежей</li>
              <li><strong className="text-foreground">MuAPI</strong> — для AI-обработки изображений</li>
              <li><strong className="text-foreground">Vercel</strong> — для хостинга приложения</li>
            </ul>
            <p className="mt-2">
              Мы не продаём и не передаём ваши данные в маркетинговых целях.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">6. Cookies</h2>
            <p>
              Мы используем необходимые cookies для авторизации и сессий. Мы не используем трекинговые cookies без вашего согласия.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">7. Контакты</h2>
            <p>
              По вопросам обработки персональных данных обращайтесь:<br />
              Email: privacy@atelier-ai.ru
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
