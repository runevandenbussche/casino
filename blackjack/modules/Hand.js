class Hand {
    constructor(deck) {
        this.cards = [];
        this.deck = deck;

    }

    addCard(deck) {
        const card = deck.drawCard();
        this.cards.push(card);
    }

    getScore() {
        let score = 0;
        let aces = 0;

        this.cards.forEach(card => {
            let value = card.getValue();


            if (value === 'J' || value === "Q" || value === "K") {
                value = 10;
            }

            else if (value === "A") {
                aces++;
                value = 11;
            } else {
                value = parseInt(value);
            }

            score += value;
        });

        // Als score > 21, maak Azen = 1 i.p.v. 11
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    isBust() {
        return this.getScore() > 21;
    }

    hasBlackJack() {
        return this.getScore() === 21 && this.cards.length === 2;
    }

    reset() {
        this.cards = [];
    }
}