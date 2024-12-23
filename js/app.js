/** json list **/
fetch('./js/items.json')
    .then(response => response.json())
    .then(items => {
        fetch('./js/monsters.json')
            .then(response => response.json())
            .then(monsters => {
                const app = new Vue({
                    el: '#panel',
                    data: {
                        display: 6000,
                        offset: 6000, // items to display after scroll
                        currentList: [],
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
                        }
                    },
                    computed: {
                        orderedList: function() {
                            const sort = this.selectedOption.dropdown.sort;
                            return this.currentList.sort(function(a, b) { return a[sort] - b[sort] }).slice(0, this.display);
                        }
                    },
                    methods: {
                        checkItem(item) {
                            if (typeof item.Name == 'undefined') {
                                return;
                            }
                            const title = item.Name[this.selectedOption.dropdown.lang];
                            const checkByItemType = ['Fish', 'Title', 'Sp'].includes(this.selectedOption.dropdown.selected);
                            return title != null && this.checkClass(checkByItemType ? item.ItemType : item.Class) && (this.contain(title, this.selectedOption.filter) || this.contain(item.Vnum.toString(), this.selectedOption.filter));
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
                        contain(str1, str2) {
                            return str1.toLowerCase().indexOf(str2.toLowerCase()) !== -1
                        },
                        switchTo(type) {
                            switch (type) {
                                case 'items':
                                    this.list.selected = ['All', 'Aventurer',
                                        'Swordman', 'Archer', 'Mage',
                                        'Martial', 'Title', 'Fish',
                                        'Sp',
                                        'MultiClass', 'UnClass'
                                    ];
                                    this.list.sort = ['Vnum', 'Price'];
                                    this.currentList = items;
                                    break;

                                case 'monsters':
                                    this.list.selected = ['All'];
                                    this.list.sort = ['Vnum'];
                                    this.currentList = monsters;
                                    break;
                            }
                            this.selectedOption.filter = '';
                            this.selectedOption.dropdown.sort = 'Vnum';
                            this.selectedOption.dropdown.selected = 'All';
                        },
                    }
                });
            });
    });