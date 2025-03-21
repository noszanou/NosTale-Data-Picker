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
            event.target.src = this.getItemIconUrl("0");
        },
        getItemIconUrl(index) {
            if (this.type == 'monsters') {
                return this.getIconFromWeb("npcs/" + index);
            }
            return this.getIconFromWeb("icons/" + index);
        },
        getIconFromWeb(sublink){
            return "https://nosapki.com/images/" + sublink  + ".png";
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

            let str = `<img class="icon" loading="lazy" src="${this.getItemIconUrl(this.currentItem.IconId)}" onerror="this.src='${this.getItemIconUrl(0)}'">`;

            const itemName = this.getItemName();
            if (fromMonster) {
                const heroLevel = this.currentItem.heroLevel ? `(+${this.currentItem.heroLevel})` : '';
                str += `<div class="name">${this.currentItem.level}Lv${heroLevel} ${itemName}</div> `;
                
            } else {
                str += `<div class="name">${itemName}</div>`;
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

            str += `<div class="clear"></div>`;

            str += `<div class="level">${BuffLevel[lang].replace(/\[br\]/g, '<br>')}</div>`;
            str += `<div class="clear"></div>`;

            str += `<div class="time">${BuffDuration[lang]}</div>`;
            str += `<div class="clear"></div>`;
            
            const description = this.getDescription();
            if (description !== 'NONE') {
                str += `<div class="descr">${description.replace(/\[n\]/g, '<br>')}</div>`;
                str += `<div class="clear"></div>`;
            }
            if (BuffId.length > 0) {
                str += `<div class="bonus">`;
                str += BuffId.map(bonus => `<div>${bonus[lang]}</div>`).join('');
                str += `</div>`;
                str += `<div class="clear"></div>`;
            }
            if (BuffIdSecond.length > 0) {
                str += `<div class="sideTime">${BuffDurationSecond[lang]}</div>`;
                str += `<div class="bonus">`;
                str += BuffIdSecond.map(bonus => `<div>${bonus[lang]}</div>`).join('');
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
            str += `<div class="clear"></div>`;

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
            str += `<div class="clear"></div>`;

            const description = this.getDescription();
            if (description !== 'NONE') {
                str += `<div class="descr">${description.replace(/\[n\]/g, '<br>')}</div>`;
            }
            return str;
        },
        renderMonsterDetails() {
            if (!this.currentItem) return '';

            const { element, attackClass, attackUpgrade, elementRate, damageMinimum, damageMaximum, concentrate,
                criticalRate, criticalChance, closeDefence, distanceDefence, magicDefence, defenceUpgrade, defenceDodge, 
                fireResistance, waterResistance, lightResistance, darkResistance, speed, xp, jobXp, isHostile, basicArea,
                noticeRange, respawnTime, Drops, maxMp, maxHp
            } = this.currentItem;

            const lang = this.selectedOption.dropdown.lang;

            let str = this.renderDefaultNameAndIcon(true);
            str += `<div class="clear"></div>`;

            str += `<div class="def0">HP: ${maxHp}</div>`;
            str += `<div class="def0">MP: ${maxMp}</div>`;
            str += `<img src="${this.getIconFromWeb(`nt-images/element_${element}`)}"> (${elementRate}%)</div>`;
            str += `<div class="clear"></div>`;

            str += `<div class="attack.plusWeapon">Attack Level: +${attackUpgrade}</div>`;
            str += `<div class="attack"><img src="${this.getIconFromWeb(`nt-images/class_${attackClass + 1}`)}"> ${damageMinimum} ~ ${damageMaximum} Hit Rate: ${concentrate}</div>`;
            str += `<div class="crit">${criticalChance}% Chance of Critical ${criticalRate}</div>`;
            str += `<div class="clear"></div>`;

            str += `<div class="attack.plusArmor">Defence Level: +${defenceUpgrade}</div>`;
            str += `<div class="def0"><img src="${this.getIconFromWeb("nt-images/class_1")}"> Defence: ${closeDefence}</div>`;
            str += `<div class="def1"><img src="${this.getIconFromWeb("nt-images/class_2")}"> Defence: ${distanceDefence}</div>`;
            str += `<div class="def2"><img src="${this.getIconFromWeb("nt-images/class_3")}"> Defence: ${magicDefence}</div>`;
            str += `<div class="dodge">Dodge: ${defenceDodge}</div>`;
            str += `<div class="clear"></div>`;

            str += `<div class="res0"><img src="${this.getIconFromWeb("nt-images/element_1")}"> Resistance: ${fireResistance}</div>`;
            str += `<div class="res1"><img src="${this.getIconFromWeb("nt-images/element_2")}"> Resistance: ${waterResistance}</div>`;
            str += `<div class="res2"><img src="${this.getIconFromWeb("nt-images/element_3")}"> Resistance: ${lightResistance}</div>`;
            str += `<div class="res3"><img src="${this.getIconFromWeb("nt-images/element_4")}"> Resistance: ${darkResistance}</div>`;
            str += `<div class="clear"></div>`;
            
            str += `<div><img src="${this.getItemIconUrl(this.getMonsterRaceTypeIcon()[0])}"> ${this.getMonsterRaceTypeIcon()[1]}</div>`;
            str += `<div>Movement Speed: ${speed}</div>`;
            str += `<div>Respawn: ${respawnTime / 10}s</div>`;
            str += `<div>Experience points: ${xp}</div>`;
            str += `<div>C-Experience points: ${parseInt(xp * 0.04)}</div>`;
            str += `<div>Job points: ${jobXp}</div>`;
            str += `<div>${(isHostile ? "Aggresive" : "Not aggresive")}</div>`;
            str += `<div>Sight range ${noticeRange}</div>`;
            str += `<div>Attack range ${basicArea}</div>`;
            str += `<div class="clear"></div>`;

            if (Drops.length > 0) {
                str += `<div class="content">`;
                str += Drops.map(drop => `<a class="item-amount-percent hover-show-name " data-id="${drop.Vnum}" data-name="${drop.Name[lang]}" data-amount="${drop.Count}">
                    <img src="${this.getItemIconUrl(drop.IconId)}">
                    <p class="amount">${drop.Count}</p>
                    <p class="percent">${drop.Chance}%</p>
                    </a>`).join('');
                str += `</div>`;
            }

            str += `<div id="hover-element-name"></div>`;
            // add flags || -onattack -ondeath -onhit -onmove -onspawn -ondefence
            return str;
        },
        getMonsterRaceTypeIcon(){
            if (!this.currentItem) return '';
            switch(parseInt(this.currentItem.race.toString() + this.currentItem.raceType.toString())){
                case 0:
                    return [18000, "Low-level Plant"];
                case 1:
                    return [18001, "Low-level Animal"];
                case 2:
                    return [18002, "Low-level Monster"];
                case 3:
                    return [18003, "Low-level Dragon"];
                case 4:
                    return [18004, "Low-level Robot"];

                case 10:
                    return [18050, "High-level Plant"];
                case 11:
                    return [18051, "High-level Animal"];
                case 12:
                    return [18052, "High-level Monster"];
                case 13:
                    return [18053, "High-level Robot Dragon"];
                case 14:
                    return [18054, "High-level Robot"];

                case 20:
                    return [18100, "Kovolt"];
                case 21:
                    return [18101, "Bushtail"];
                case 22:
                    return [18102, "Catsy"];
    
                case 30:
                    return [18150, "Human being"];
                case 31:
                    return [18151, "Elf"];
                case 32:
                    return [18152, "Half"];
                case 33:
                    return [18153, "Demon"];
                case 34:
                    return [18154, "Orc"];
                case 35:
                    return [18155, "Draconian"];
                case 36:
                    return [18156, "Mullan"];
    
                case 40:
                    return [18200, "Angel"];
                case 50:
                    return [18250, "Low-level Undead"];
                case 51:
                    return [18251, "High-level Undead"];
                case 60:
                    return [18300, "Low-level spirit"];
                default:
                    return [0, "Fixed trap"];
            }
        }
    },
    created() {
        this.fetchData();
    }
});