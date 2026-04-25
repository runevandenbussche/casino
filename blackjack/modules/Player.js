class Player {
    constructor(name, chips) {
        this.name = name;
        this.chips = chips;
        this.bet = 0;
        this.hand = new Hand();
    }

    placeBet(amount) {
        if (amount>this.chips) {
            console.log("Your bet exceeds your total amount of chips!");
            return false;
        } else {
            this.chips -= amount;
            this.bet = amount;
            return true;
        }
    }

    winAmount(amount) {
        this.chips += amount;
    }

    resetHand() {
        this.hand.reset();
        this.bet = 0;
    }

    toString() {
        return name + "\t bet: " + this.bet + "\t bank: " + this.chips;
    }
}