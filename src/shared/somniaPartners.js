export const somniaPartners = {
  nodes: [
    {
      id: 'company1',
      name: 'Компания 1',
      description: 'Описание компании 1: лидер в блокчейн-технологиях.',
    },
    {
      id: 'company2',
      name: 'Компания 2',
      description: 'Описание компании 2: разработчик смарт-контрактов.',
    },
    { id: 'company3', name: 'Компания 3', description: 'Описание компании 3: поставщик данных.' },
  ],
  links: [
    { source: 'company1', target: 'company2' },
    { source: 'company2', target: 'company3' },
  ],
};
