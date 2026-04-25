class Dealer{
    constructor(){
        this.hand = new Hand();
    }

    shouldHit(){
        return this.hand.getScore()<17;
    }

    play(deck){
        while (this.shouldHit()){
            this.hand.addCard(deck);
        }
    }

    resetHand(){
        this.hand.reset();
    }
}