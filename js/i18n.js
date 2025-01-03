const messages = {
    Uk: {
        items: 'Items',
        monsters: 'Monsters',
        buffs: 'Buffs',
        skills: 'Skills',
        searchPlaceholder: 'Name/Vnum...',
    },
    Fr: {
        items: 'Objets',
        monsters: 'Monstres',
        buffs: 'Buffs',
        skills: 'Compétences',
        searchPlaceholder: 'Nom/Vnum...',
    }
};

const i18n = new VueI18n({
    locale: 'Uk',
    fallbackLocale: 'Uk',
    messages,
});