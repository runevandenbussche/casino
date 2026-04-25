class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
    }

    toString() {
        return `${this.value} of ${this.suit}`;
    }

    getValue() {
        return this.value;
    }

    getSuit() {
        return this.suit;
    }

    getAfbeelding() {
        const suitMap = {
            'Klaveren': 'CLUB',
            'Ruiten':   'DIAMOND',
            'Harten':   'HEART',
            'Schoppen': 'SPADE'
        };

        const valueMap = {
            'A':  '1',
            'J':  '11-JACK',
            'Q':  '12-QUEEN',
            'K':  '13-KING'
        };

        const suit = suitMap[this.suit];
        const value = valueMap[this.value] || this.value; // gewone nummers blijven hetzelfde

        return `../kaarten/${suit}-${value}.svg`;
    }
}