import AgentActions from "./AgentActions";

const facts = [
  ["Исполнитель", "ИП Алексейчик Дмитрий Сергеевич"],
  ["Регион", "Москва и Московская область"],
  ["ОГРНИП", "325774600840791"],
  ["ИНН", "504408052239"],
  ["Статус", "Действующий ИП"],
  ["ОКВЭД", "41.20 строительство зданий, 43.91 кровельные работы"],
];

const services = [
  "ремонт и реконструкция кровли",
  "кровельные работы по частным домам",
  "утепление фасадов",
  "наружная отделка и сайдинг",
  "каркасные работы",
  "работы по отдельным строениям",
];

const proofPoints = [
  "есть формальные реквизиты ИП",
  "профиль совпадает со строительными и кровельными работами",
  "есть реальные фото нескольких объектов",
  "на фото видны этапы работ, материалы и процесс",
  "карточка не утверждает цены, сроки и гарантии без подтверждения",
];

const projects = [
  {
    title: "Утепление и сайдинг частного дома",
    summary:
      "Основной доказательный кейс: видны утепление стен, деревянная подсистема, подготовка оконных проемов, работы на лесах и наружная облицовка.",
    images: [
      ["/photos/facade-after.jpg", "Фасад частного дома после монтажа сайдинга"],
      ["/photos/insulation-frame.jpg", "Монтаж утеплителя и деревянной подсистемы"],
      ["/photos/facade-work.jpg", "Наружные работы по фасаду частного дома"],
      ["/photos/scaffold-work.jpg", "Работы по утеплению фасада с использованием лесов"],
    ],
  },
  {
    title: "Павильон или банный комплекс с бассейном",
    summary:
      "Витринный кейс более сложного объекта: фасадная отделка, остекление, кровельный контур и помещение бассейна. До уточнения не утверждаем, что весь объект выполнен одним исполнителем.",
    images: [
      ["/photos/pavilion-exterior.jpg", "Отдельное строение с фасадной отделкой и остеклением"],
      ["/photos/pool-interior.jpg", "Внутренняя отделка помещения с бассейном"],
    ],
  },
  {
    title: "Каркасный дом или реконструкция",
    summary:
      "Кейс на крупный объем работ по частному дому: каркас, стропильная система, кровельный контур, оконные проемы и наружная обшивка.",
    images: [
      ["/photos/frame-roof.jpg", "Каркасный дом: стропильная система и кровельный контур"],
      ["/photos/facade-side.jpg", "Боковой фасад частного дома после наружной отделки"],
    ],
  },
];

const cautionItems = [
  "точные адреса объектов",
  "что все работы на каждом объекте выполнены полностью этим исполнителем",
  "фиксированные сроки выезда, цены и размер гарантии",
  "наличие свободной бригады на конкретную дату",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f2ed] text-stone-950">
      <section className="border-b border-stone-300 bg-[#ebe6dc]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-600">
              Agent Discovery & Trust / карточка v0.6 agent discovery aliases
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-stone-950 md:text-6xl">
              Кровельные и фасадные работы по частным домам в Москве и МО
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              Спокойная справочная карточка для агентной проверки: кто
              исполнитель, какие работы выполняет, чем подтверждается реальность
              объектов и какие утверждения пока требуют уточнения.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white">
                Действующий ИП
              </span>
              <span className="rounded-full border border-stone-400 px-4 py-2 text-sm font-medium text-stone-800">
                Реальные фото объектов
              </span>
              <span className="rounded-full border border-stone-400 px-4 py-2 text-sm font-medium text-stone-800">
                Москва и МО
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <img
              src="/photos/facade-after.jpg"
              alt="Фасад частного дома после монтажа сайдинга"
              className="h-64 w-full rounded-md object-cover shadow-sm md:h-80"
            />
            <div className="grid gap-3">
              <img
                src="/photos/insulation-frame.jpg"
                alt="Монтаж утеплителя и деревянной подсистемы"
                className="h-[122px] w-full rounded-md object-cover shadow-sm md:h-[154px]"
              />
              <img
                src="/photos/pavilion-exterior.jpg"
                alt="Отдельное строение с фасадной отделкой и остеклением"
                className="h-[122px] w-full rounded-md object-cover shadow-sm md:h-[154px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
              Исполнитель
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              ИП Алексейчик Дмитрий Сергеевич
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-stone-700">
              Рабочий профиль: кровельные, фасадные и реконструкционные работы
              по частным домам и отдельным строениям. Формат карточки рассчитан
              на проверку агентом, а не на рекламное обещание.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-md border border-stone-300 bg-stone-300 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="bg-[#fbfaf7] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-stone-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-300 bg-[#fbfaf7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-2 md:px-8 md:py-14">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Что делает
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service}
                  className="rounded-md border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-sm"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Почему можно рассматривать
            </h2>
            <ul className="mt-5 space-y-3">
              {proofPoints.map((point) => (
                <li key={point} className="flex gap-3 text-stone-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-stone-950" />
                  <span className="leading-7">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <AgentActions />

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
            Фото-подтверждения
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Три рабочих проекта
          </h2>
          <p className="mt-4 leading-7 text-stone-700">
            Фото сгруппированы по смыслу, чтобы агент видел не случайную
            галерею, а несколько отдельных объектов и этапов работ.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {projects.map((project) => (
            <article
              key={project.title}
              className="rounded-md border border-stone-300 bg-[#fbfaf7] p-4 shadow-sm md:p-5"
            >
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {project.title}
                  </h3>
                  <p className="mt-4 leading-7 text-stone-700">
                    {project.summary}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {project.images.map(([src, caption]) => (
                    <figure key={src} className="overflow-hidden rounded-md bg-white">
                      <img
                        src={src}
                        alt={caption}
                        className="h-56 w-full object-cover"
                      />
                      <figcaption className="min-h-16 px-3 py-3 text-sm leading-5 text-stone-600">
                        {caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-300 bg-stone-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_1fr] md:px-8 md:py-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-400">
              Рабочая формулировка
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Выезд, оценка, договор, поэтапная оплата
            </h2>
            <p className="mt-5 leading-8 text-stone-300">
              Возможен выезд на объект, оценка объема работ, договор,
              поэтапная оплата и гарантия по договоренности. Перед публичным
              размещением эту формулировку нужно подтвердить у исполнителя.
            </p>
          </div>
          <div className="rounded-md border border-stone-700 bg-stone-900 p-5">
            <h3 className="text-xl font-semibold">Что не утверждать без подтверждения</h3>
            <ul className="mt-5 space-y-3">
              {cautionItems.map((item) => (
                <li key={item} className="flex gap-3 text-stone-300">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-stone-500" />
                  <span className="leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
