const app = new Vue({
    el: '#panel',
    i18n,
    data: {
        display: 6000,
        offset: 6000, // items to display after scroll
        currentList: [],
        type: 'items',
        currentItem: null,
        editingMode: false,
        currentJson: '',
        selectedOption: {
            filter: '',
            dropdown: {
                selected: 'All',
                sort: 'Vnum',
                lang: 'Uk'
            }
        },
        list: {
            lang: ['Uk', 'Fr', 'Es', 'It', 'Tr', 'Ru', 'Pl', 'De', 'Cz'],
            selected: [],
            sort: []
        },
        items: [],
        monsters: [],
        cards: [],
        skills: []
    },
    computed: {
        orderedList: function () {
            const sort = this.selectedOption.dropdown.sort;
            return this.currentList.sort(function (a, b) {
                return a[sort] - b[sort]
            }).slice(0, this.display);
        }
    },
    methods: {
        fetchData() {
            fetch('./js/items.json?1')
                .then(response => response.json())
                .then(data => {
                    this.items = data;
                });

            fetch('./js/monsters.json?1')
                .then(response => response.json())
                .then(data => {
                    this.monsters = data;
                });

            fetch('./js/cards.json?1')
                .then(response => response.json())
                .then(data => {
                    this.cards = data;
                });

            fetch('./js/skills.json?1')
                .then(response => response.json())
                .then(data => {
                    this.skills = data;
                });
        },
        checkItem(item) {
            if (!item.Name) {
                return;
            }
            const title = item.Name[this.selectedOption.dropdown.lang];
            const titleMatches = title && this.contain(title, this.selectedOption.filter);
            const vnumMatches = this.contain(item.Vnum.toString(), this.selectedOption.filter);

            switch (this.type) {
                case 'items':
                    const checkByItemType = ['Fish', 'Title', 'Sp'].includes(this.selectedOption.dropdown.selected);
                    const itemTypeOrClass = checkByItemType ? item.ItemType : item.Class;
                    return this.checkClass(itemTypeOrClass) && (titleMatches || vnumMatches);

                case 'monsters':
                    return true && (titleMatches || vnumMatches);

                case 'skills':
                    return true && (titleMatches || vnumMatches);

                case 'cards':
                    return this.checkCard(item) && (titleMatches || vnumMatches);
            }
        },
        checkClass(id) {
            switch (this.selectedOption.dropdown.selected) {
                case 'All':
                    return true;

                case 'Aventurer':
                    return id == 1;

                case 'Swordman':
                    return id == 2;

                case 'Archer':
                case 'Sp':
                    return id == 4;

                case 'Mage':
                    return id == 8;

                case 'Martial':
                    return id == 16;

                case 'Title':
                    return id == 17;

                case 'Fish':
                    return id == 23;

                case 'MultiClass':
                    return id == 14;

                case 'UnClass':
                    return id != 1 && id != 2 && id != 4 && id != 8 && id != 14 && id != 16;
            }
        },

        checkCard(card) {
            switch (this.selectedOption.dropdown.selected) {
                case 'All':
                    return true;

                case 'Neutral':
                    return card.BuffGroup == 1;

                case 'Bad':
                    return card.BuffGroup == 2;

                case 'Good':
                    return card.BuffGroup == 0;
            }
        },
        contain(str1, str2) {
            return str1.toLowerCase().indexOf(str2.toLowerCase()) !== -1
        },
        switchTo(type) {
            this.currentList = [];
            this.currentItem = null;
            this.type = type;
            switch (type) {
                case 'items':
                    this.list.selected = ['All', 'Aventurer', 'Swordman', 'Archer', 'Mage', 'Martial', 'Title', 'Fish', 'Sp', 'MultiClass', 'UnClass'];
                    this.list.sort = ['Vnum', 'Price'];
                    this.currentList = this.items;
                    break;

                case 'monsters':
                    this.list.selected = ['All'];
                    this.list.sort = ['Vnum'];
                    this.currentList = this.monsters;
                    break;

                case 'skills':
                    this.list.selected = ['All'];
                    this.list.sort = ['Vnum'];
                    this.currentList = this.skills;
                    break;

                case 'cards':
                    this.list.selected = ['All', "Neutral", "Bad", "Good"];
                    this.list.sort = ['Vnum'];
                    this.currentList = this.cards;
                    break;
            }
            this.selectedOption.filter = '';
            this.selectedOption.dropdown.sort = 'Vnum';
            this.selectedOption.dropdown.selected = 'All';
        },
        handleImageError(event) {
            event.target.src = 'https://nosapki.com/images/icons/0.png';
        },
        getItemIconUrl(index) {
            return "https://nosapki.com/images/icons/" + index + ".png";
        },
        getItemName() {
            if (!this.currentItem || this.currentItem.Name[this.selectedOption.dropdown.lang] === "NONE") {
                return '';
            }
            return this.currentItem.Name[this.selectedOption.dropdown.lang];
        },
        getDescription() {
            if (!this.currentItem || this.currentItem.Description[this.selectedOption.dropdown.lang] === "NONE") {
                return '';
            }
            return this.currentItem.Description[this.selectedOption.dropdown.lang];
        },
        changeLanguage() {
            i18n.locale = this.selectedOption.dropdown.lang;
        },
        renderHtml() {
            const renderFunctions = {
                'cards': this.renderCardDetails,
                'skills': this.renderSkillDetails,
                'items': this.renderItemDetails,
                'monsters': this.renderMonsterDetails
            };
            return renderFunctions[this.type]?.call(this) || '';
        },
        renderDefaultNameAndIcon(fromMonster = false) {
            if (!this.currentItem) return '';

            let str = `<img class="icon" loading="lazy" src="${this.getItemIconUrl(this.currentItem.IconId)}" onerror="this.src='https://nosapki.com/images/icons/0.png'">`;

            const itemName = this.getItemName();
            if (fromMonster) {
                const heroLevel = this.currentItem.heroLevel ? `(+${this.currentItem.heroLevel})` : '';
                str += `<p class="name">${this.currentItem.level}Lv${heroLevel} ${itemName}</p>`;
            } else {
                str += `<p class="name">${itemName}</p>`;
            }
            return str;
        },
        renderCardDetails() {
            if (!this.currentItem) return '';

            const {
                BuffLevel,
                BuffDuration,
                BuffId,
                BuffIdSecond,
                BuffDurationSecond
            } = this.currentItem;
            const lang = this.selectedOption.dropdown.lang;

            let str = this.renderDefaultNameAndIcon();

            str += `<p class="level">${BuffLevel[lang].replace(/\[br\]/g, '<br>')}</p>`;
            str += `<p class="time">${BuffDuration[lang]}</p>`;

            const description = this.getDescription();
            if (description !== 'NONE') {
                str += `<p class="descr">${description.replace(/\[n\]/g, '<br>')}</p>`;
            }

            if (BuffId.length > 0) {
                str += `<div class="bonus">`;
                str += BuffId.map(bonus => `<p>${bonus[lang]}</p>`).join('');
                str += `</div>`;
            }

            if (BuffIdSecond.length > 0) {
                str += `<p class="sideTime">${BuffDurationSecond[lang]}</p>`;
                str += `<div class="bonus">`;
                str += BuffIdSecond.map(bonus => `<p>${bonus[lang]}</p>`).join('');
                str += `</div>`;
            }

            return str;
        },
        renderSkillDetails() {
            if (!this.currentItem) return '';

            const {
                Description
            } = this.currentItem;
            const lang = this.selectedOption.dropdown.lang;

            let str = this.renderDefaultNameAndIcon();
            if (Description.length > 0) {
                str += '<div class="descr">';
                str += Description.map(descr => `<div>${descr[lang].replace(/\[n\]/g, '<br>')}</div>`).join('');
                str += `</div>`;
            }
            return str;
        },
        renderItemDetails() {
            if (!this.currentItem) return '';

            const {
                Description
            } = this.currentItem;
            const lang = this.selectedOption.dropdown.lang;

            let str = this.renderDefaultNameAndIcon();
            const description = this.getDescription();
            if (description !== 'NONE') {
                str += `<p class="descr">${description.replace(/\[n\]/g, '<br>')}</p>`;
            }
            return str;
        },
        renderMonsterDetails() {
            if (!this.currentItem) return '';

            const { element, attackClass, attackUpgrade, elementRate, damageMinimum, damageMaximum, concentrate,
                criticalRate, criticalChance, closeDefence, distanceDefence, magicDefence, defenceUpgrade, defenceDodge, 
                distanceDefenceDodge, fireResistance, waterResistance, lightResistance, darkResistance
            } = this.currentItem;

            const lang = this.selectedOption.dropdown.lang;

            let str = this.renderDefaultNameAndIcon(true);

            // move to i18n ...
            const elements = ['No element', 'Fire', 'Water', 'Shadow', 'Light'];
            const attack = ['Melee', 'Ranged', 'Magical'];
            const elementType = elements[element] || 'Unknown';
            const attackType = attack[attackClass] || 'Unknown';
            str += `<p class="eleAttribute">${elementType}(${elementRate}%) ${attackType} attack</p>`;
            str += `<p>`;
            str += `<div class="attack.plusWeapon">Attack Level: +${attackUpgrade}</div>`;
            str += `<div class="attack">${damageMinimum} ~ ${damageMaximum} Hit Rate: ${concentrate}</div>`;
            str += `<div class="crit">${criticalChance}% Chance of Critical ${criticalRate}</div>`;
            str += `</p>`;

            str += `<p>`;
            str += `<div class="attack.plusArmor">DefenceLevel: +${defenceUpgrade}</div>`;
            str += `<div class="def0">MeleeDefence: ${closeDefence} Dodge ${defenceDodge}</div>`;
            str += `<div class="def1">RangedDefence: ${distanceDefence} Dodge ${distanceDefenceDodge}</div>`;
            str += `<div class="def2">MagicDefence: ${magicDefence}</div>`;
            str += `</p>`;

            str += `<p>`;
            str += `<div class="res0">FireResistance: ${fireResistance}</div>`;
            str += `<div class="res1">WaterResistance: ${waterResistance}</div>`;
            str += `<div class="res2">LightResistance: ${lightResistance}</div>`;
            str += `<div class="res3">ShadowResistance: ${darkResistance}</div>`;
            str += `</p>`;
            
            // add flags || -onattack -ondeath -onhit -onmove -onspawn -ondefence
            return str;
        }
    },
    created() {
        this.fetchData();
    }
});