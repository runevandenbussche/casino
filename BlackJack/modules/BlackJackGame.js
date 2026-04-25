class BlackJackGame {
    constructor() {
        this.deck = new Deck();
        this.deck.shuffle();
        this.player = new Player("Speler", 1000);
        this.dealer = new Dealer();
        this.gameState = "waiting";
        this.result = null;
        this.bet = 0;

        // Split variabelen
        this.splitHanden = [];
        this.activeSplitHand = 0;
        this.isSplit = false;

        this.updateDisplay();
    }

    // ===== DISPLAY =====

    updateDisplay() {
        document.getElementById('betBedrag').textContent = '$' + this.bet;
        document.getElementById('bankBedrag').textContent = '$' + this.player.chips;
    }

    toonKaart(kaart, containerId, verborgen = false) {
        const container = document.getElementById(containerId);
        const div = document.createElement('div');
        div.classList.add('kaart');

        if (verborgen) {
            div.textContent = '🂠';
            div.classList.add('kaart-verborgen');
        } else {
            const img = document.createElement('img');
            img.src = kaart.getAfbeelding();
            img.style.width = '100%';
            img.style.height = '100%';
            div.appendChild(img);
        }

        container.appendChild(div);
    }

    clearKaarten() {
        document.getElementById('kaartenDealer').innerHTML = '';
        document.getElementById('kaartenPlayer').innerHTML = '';
        const split1 = document.getElementById('kaartenSplit1');
        const split2 = document.getElementById('kaartenSplit2');
        if (split1) split1.innerHTML = '';
        if (split2) split2.innerHTML = '';
    }

    toonBericht(tekst, kleur = '#f5c842') {
        let bericht = document.getElementById('berichtDisplay');
        bericht.style.color = kleur;
        bericht.textContent = tekst;
    }

    toonActieKnoppen(spelBezig) {
        document.getElementById('actieKnoppen').style.display = spelBezig ? 'flex' : 'none';
        document.getElementById('betKnoppen').style.display   = spelBezig ? 'none' : 'flex';
        document.getElementById('chipRij').style.display      = spelBezig ? 'none' : 'flex';
    }

    updateScore() {
        document.getElementById('playerScore').textContent = 'Score: ' + this.player.hand.getScore();
        document.getElementById('dealerScore').textContent = 'Score: ?';
    }

    // ===== SPLIT ZONES =====

    maakSplitZones() {
        document.getElementById('kaartenPlayer').style.display = 'none';

        if (!document.getElementById('splitZones')) {
            const splitZones = document.createElement('div');
            splitZones.id = 'splitZones';
            splitZones.style.cssText = 'display:flex; gap:16px; justify-content:center; width:100%;';

            splitZones.innerHTML = `
                <div class="split-zone" id="splitZone1">
                    <div class="zone-label">Hand 1</div>
                    <div id="kaartenSplit1" class="kaarten-split"></div>
                    <div id="splitScore1" class="split-score"></div>
                </div>
                <div class="split-zone" id="splitZone2">
                    <div class="zone-label">Hand 2</div>
                    <div id="kaartenSplit2" class="kaarten-split"></div>
                    <div id="splitScore2" class="split-score"></div>
                </div>
            `;

            document.getElementById('playerZone').appendChild(splitZones);
        } else {
            document.getElementById('splitZones').style.display = 'flex';
            document.getElementById('kaartenSplit1').innerHTML = '';
            document.getElementById('kaartenSplit2').innerHTML = '';
            document.getElementById('splitScore1').textContent = '';
            document.getElementById('splitScore2').textContent = '';
        }
    }

    verwijderSplitZones() {
        const splitZones = document.getElementById('splitZones');
        if (splitZones) splitZones.style.display = 'none';
        document.getElementById('kaartenPlayer').style.display = 'flex';
    }

    markeerActieveSplitHand() {
        document.getElementById('splitZone1').style.outline = this.activeSplitHand === 0 ? '2px solid #f5c842' : 'none';
        document.getElementById('splitZone2').style.outline = this.activeSplitHand === 1 ? '2px solid #f5c842' : 'none';
    }

    // ===== INZET =====

    voegToe(bedrag) {
        if (this.gameState !== "waiting") return;
        if (this.bet + bedrag > this.player.chips) return;
        this.bet += bedrag;
        this.updateDisplay();
    }

    wisInzet() {
        if (this.gameState !== "waiting") return;
        this.bet = 0;
        this.updateDisplay();
    }

    // ===== SPEL =====

    dealCards() {
        if (this.bet === 0) {
            this.toonBericht('Plaats eerst een inzet!', '#ff6b6b');
            return;
        }

        if (this.deck.cards.length < 15) {
            this.deck = new Deck();
            this.deck.shuffle();
        }

        this.player.placeBet(this.bet);
        this.player.hand.reset();
        this.dealer.hand.reset();
        this.result = null;
        this.isSplit = false;
        this.splitHanden = [];
        this.activeSplitHand = 0;
        this.verwijderSplitZones();
        this.clearKaarten();
        this.toonBericht('');
        this.updateDisplay();

        // Kaarten uitdelen
        this.player.hand.addCard(this.deck);
        this.dealer.hand.addCard(this.deck);
        this.player.hand.addCard(this.deck);

        // Dealer: 1 zichtbaar, 1 verborgen
        this.toonKaart(this.dealer.hand.cards[0], 'kaartenDealer');
        this.toonKaart(null, 'kaartenDealer', true);

        // Speler: beide zichtbaar
        this.player.hand.cards.forEach(k => this.toonKaart(k, 'kaartenPlayer'));
        this.updateScore();

        const getWaarde10 = (kaart) => {
            const v = kaart.getValue();
            return (v === 'J' || v === 'Q' || v === 'K') ? '10' : v;
        };

        // Split knop enkel actief als 2 kaarten dezelfde waarde hebben
        const k1 = getWaarde10(this.player.hand.cards[0]);
        const k2 = getWaarde10(this.player.hand.cards[1]);
        const kanSpliten = k1 === k2 && this.player.bet <= this.player.chips;
        document.getElementById('split').style.opacity = kanSpliten ? '1' : '0.3';
        document.getElementById('split').disabled = !kanSpliten;

        if (this.player.hand.hasBlackJack()) {
            this.toonBericht('🎉 BLACKJACK!', '#f5c842');
            this.result = "playerBlackJack";
            this.eindRonde();
            return;
        }

        this.gameState = "playing";
        this.toonActieKnoppen(true);
    }

    playerHit() {
        if (this.gameState !== "playing") return;

        if (this.isSplit) {
            const hand = this.splitHanden[this.activeSplitHand];
            hand.addCard(this.deck);
            const nieuweKaart = hand.cards[hand.cards.length - 1];
            const containerId = this.activeSplitHand === 0 ? 'kaartenSplit1' : 'kaartenSplit2';
            const scoreId = this.activeSplitHand === 0 ? 'splitScore1' : 'splitScore2';
            this.toonKaart(nieuweKaart, containerId);
            document.getElementById(scoreId).textContent = 'Score: ' + hand.getScore();

            if (hand.isBust()) {
                this.toonBericht(`💥 Hand ${this.activeSplitHand + 1} bust!`, '#ff6b6b');
                setTimeout(() => this.volgendeSplitHand(), 1000);
            }
        } else {
            this.player.hand.addCard(this.deck);
            const nieuweKaart = this.player.hand.cards[this.player.hand.cards.length - 1];
            this.toonKaart(nieuweKaart, 'kaartenPlayer');
            this.updateScore();

            if (this.player.hand.isBust()) {
                this.toonBericht('💥 BUST! Dealer wint.', '#ff6b6b');
                this.result = "dealer";
                this.eindRonde();
            }
        }
    }

    playerStand() {
        if (this.gameState !== "playing") return;

        if (this.isSplit) {
            this.volgendeSplitHand();
        } else {
            this.dealerTurn();
        }
    }

    playerDouble() {
        if (this.gameState !== "playing") return;
        if (this.player.bet > this.player.chips) {
            this.toonBericht('Niet genoeg chips!', '#ff6b6b');
            return;
        }
        this.player.chips -= this.player.bet;
        this.player.bet *= 2;
        this.bet = this.player.bet;
        this.updateDisplay();

        this.player.hand.addCard(this.deck);
        const nieuweKaart = this.player.hand.cards[this.player.hand.cards.length - 1];
        this.toonKaart(nieuweKaart, 'kaartenPlayer');
        this.updateScore();

        if (this.player.hand.isBust()) {
            this.toonBericht('💥 BUST! Dealer wint.', '#ff6b6b');
            this.result = "dealer";
            this.eindRonde();
        } else {
            this.dealerTurn();
        }
    }

    playerSplit() {
        if (this.gameState !== "playing") return;
        if (this.player.bet > this.player.chips) {
            this.toonBericht('Niet genoeg chips voor split!', '#ff6b6b');
            return;
        }

        // Extra inzet voor tweede hand
        this.player.chips -= this.player.bet;
        this.bet = this.player.bet * 2;
        this.updateDisplay();

        // 2 nieuwe handen aanmaken
        this.isSplit = true;
        this.activeSplitHand = 0;
        this.splitHanden = [new Hand(), new Hand()];

        // Eerste kaart van elke hand (originele 2 kaarten splitsen)
        this.splitHanden[0].cards.push(this.player.hand.cards[0]);
        this.splitHanden[1].cards.push(this.player.hand.cards[1]);

        // Tweede kaart voor elke hand trekken
        this.splitHanden[0].addCard(this.deck);
        this.splitHanden[1].addCard(this.deck);

        // Split zones tonen
        this.maakSplitZones();

        // Kaarten tonen
        this.splitHanden[0].cards.forEach(k => this.toonKaart(k, 'kaartenSplit1'));
        this.splitHanden[1].cards.forEach(k => this.toonKaart(k, 'kaartenSplit2'));

        document.getElementById('splitScore1').textContent = 'Score: ' + this.splitHanden[0].getScore();
        document.getElementById('splitScore2').textContent = 'Score: ' + this.splitHanden[1].getScore();

        // Split knop uitschakelen
        document.getElementById('split').style.opacity = '0.3';
        document.getElementById('split').disabled = true;

        this.markeerActieveSplitHand();
        this.toonBericht('✋ Hand 1 aan de beurt', '#f5c842');
    }

    volgendeSplitHand() {
        if (this.activeSplitHand === 0) {
            this.activeSplitHand = 1;
            this.markeerActieveSplitHand();
            this.toonBericht('✋ Hand 2 aan de beurt', '#f5c842');
        } else {
            this.dealerTurn();
        }
    }

    dealerTurn() {
        document.getElementById('kaartenDealer').innerHTML = '';
        this.dealer.hand.cards.forEach(k => this.toonKaart(k, 'kaartenDealer'));

        const dealerTrekKaart = () => {
            if (this.dealer.shouldHit()) {
                this.dealer.hand.addCard(this.deck);
                document.getElementById('kaartenDealer').innerHTML = '';
                this.dealer.hand.cards.forEach(k => this.toonKaart(k, 'kaartenDealer'));
                document.getElementById('dealerScore').textContent = 'Score: ' + this.dealer.hand.getScore();
                setTimeout(dealerTrekKaart, 2000);
            } else {
                document.getElementById('dealerScore').textContent = 'Score: ' + this.dealer.hand.getScore();
                this.bepaalWinnaar();
                this.eindRonde();
            }
        };

        setTimeout(dealerTrekKaart, 2000);
    }

    bepaalWinnaar() {
        const ds = this.dealer.hand.getScore();

        if (this.isSplit) {
            let berichten = [];
            this.splitHanden.forEach((hand, i) => {
                const ps = hand.getScore();
                if (hand.isBust()) {
                    berichten.push(`Hand ${i+1}: verloren`);
                } else if (this.dealer.hand.isBust() || ps > ds) {
                    this.player.winAmount(this.player.bet * 2);
                    berichten.push(`Hand ${i+1}: gewonnen 🏆`);
                } else if (ps === ds) {
                    this.player.winAmount(this.player.bet);
                    berichten.push(`Hand ${i+1}: gelijkspel 🤝`);
                } else {
                    berichten.push(`Hand ${i+1}: verloren`);
                }
            });
            this.toonBericht(berichten.join('  |  '), '#f5c842');
            this.result = "splitKlaar";
        } else {
            const ps = this.player.hand.getScore();
            if (this.dealer.hand.isBust() || ps > ds) {
                this.result = "player";
                this.toonBericht('🏆 Je wint!', '#4cff72');
            } else if (ps === ds) {
                this.result = "push";
                this.toonBericht('🤝 Gelijkspel!', '#f5c842');
            } else {
                this.result = "dealer";
                this.toonBericht('😞 Dealer wint.', '#ff6b6b');
            }
        }
    }

    eindRonde() {
        this.toonActieKnoppen(false);

        if (!this.isSplit) {
            const bet = this.player.bet;
            switch (this.result) {
                case "playerBlackJack":
                    this.player.winAmount(bet + Math.floor(bet * 1.5));
                    break;
                case "player":
                    this.player.winAmount(bet * 2);
                    break;
                case "push":
                    this.player.winAmount(bet);
                    break;
                case "dealer":
                    break;
            }
        }

        this.bet = 0;
        this.gameState = this.player.chips === 0 ? "gameOver" : "waiting";
        this.updateDisplay();

        if (this.gameState === "gameOver") {
            this.toonBericht('💸 Game Over! Geen chips meer.', '#ff6b6b');
        }
    }
}

// ===== GLOBALE INSTANTIE =====
var game = new BlackJackGame();

function voegToe(bedrag)  { game.voegToe(bedrag); }
function wisInzet()       { game.wisInzet(); }
function dealCards()      { game.dealCards(); }
function playerHit()      { game.playerHit(); }
function playerStand()    { game.playerStand(); }
function playerDouble()   { game.playerDouble(); }
function playerSplit()    { game.playerSplit(); }