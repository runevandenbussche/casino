class BaccaratGame {
    constructor() {
        this.deck = new Deck();
        this.deck.shuffle();
        this.playerHand = new Hand();
        this.bankerHand = new Hand();
        this.gameState = "waiting";
        this.bet = 0;
        this.weddenOp = null; // "player", "banker", "tie"
        this.chips = 1000;

        this.updateDisplay();
    }

    // ===== WAARDE =====

    getKaartWaarde(kaart) {
        const v = kaart.getValue();
        if (v === 'J' || v === 'Q' || v === 'K' || v === '10') return 0;
        if (v === 'A') return 1;
        return parseInt(v);
    }

    getHandScore(hand) {
        const totaal = hand.cards.reduce((sum, k) => sum + this.getKaartWaarde(k), 0);
        return totaal % 10;
    }

    // ===== DISPLAY =====

    updateDisplay() {
        document.getElementById('betBedrag').textContent = '$' + this.bet;
        document.getElementById('bankBedrag').textContent = '$' + this.chips;
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
        document.getElementById('kaartenBanker').innerHTML = '';
        document.getElementById('kaartenPlayer').innerHTML = '';
    }

    toonBericht(tekst, kleur = '#f5c842') {
        const bericht = document.getElementById('berichtDisplay');
        bericht.style.color = kleur;
        bericht.textContent = tekst;
    }

    updateScores(toonBanker = true) {
        document.getElementById('playerScore').textContent = 'Score: ' + this.getHandScore(this.playerHand);
        document.getElementById('bankerScore').textContent = toonBanker
            ? 'Score: ' + this.getHandScore(this.bankerHand)
            : 'Score: ?';
    }

    // ===== INZET =====

    setWeddenOp(keuze) {
        if (this.gameState !== "waiting") return;
        this.weddenOp = keuze;

        document.querySelectorAll('.wed-knop').forEach(btn => btn.classList.remove('actief'));
        document.getElementById('wed-' + keuze).classList.add('actief');

        this.toonBericht('Je wedt op: ' + this.getLabelVoor(keuze), '#f5c842');
    }

    getLabelVoor(keuze) {
        return keuze === 'player' ? 'Speler' : keuze === 'banker' ? 'Bank' : 'Gelijkspel';
    }

    voegToe(bedrag) {
        if (this.gameState !== "waiting") return;
        if (this.bet + bedrag > this.chips) return;
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
        if (!this.weddenOp) {
            this.toonBericht('Kies eerst: Speler, Bank of Gelijkspel!', '#ff6b6b');
            return;
        }

        if (this.deck.cards.length < 15) {
            this.deck = new Deck();
            this.deck.shuffle();
        }

        this.chips -= this.bet;
        this.playerHand = new Hand();
        this.bankerHand = new Hand();
        this.clearKaarten();
        this.toonBericht('');
        this.updateDisplay();

        // 2 kaarten voor elk
        this.playerHand.addCard(this.deck);
        this.bankerHand.addCard(this.deck);
        this.playerHand.addCard(this.deck);
        this.bankerHand.addCard(this.deck);

        // Toon kaarten
        this.playerHand.cards.forEach(k => this.toonKaart(k, 'kaartenPlayer'));
        this.bankerHand.cards.forEach(k => this.toonKaart(k, 'kaartenBanker'));
        this.updateScores();

        const ps = this.getHandScore(this.playerHand);
        const bs = this.getHandScore(this.bankerHand);

        // Natural (8 of 9) → direct einde
        if (ps >= 8 || bs >= 8) {
            this.bepaalWinnaar();
            return;
        }

        // Derde kaart regels
        this.derdKaartRegel(ps, bs);
    }

    derdKaartRegel(ps, bs) {
        let playerDrew = false;
        let playerDerdeKaart = null;

        // Speler trekt bij 0-5
        if (ps <= 5) {
            this.playerHand.addCard(this.deck);
            playerDerdeKaart = this.playerHand.cards[2];
            this.toonKaart(playerDerdeKaart, 'kaartenPlayer');
            playerDrew = true;
        }

        // Bank trekregels
        if (playerDrew) {
            const derdeWaarde = this.getKaartWaarde(playerDerdeKaart);
            if (bs <= 2) {
                this.bankerHand.addCard(this.deck);
                this.toonKaart(this.bankerHand.cards[this.bankerHand.cards.length - 1], 'kaartenBanker');
            } else if (bs === 3 && derdeWaarde !== 8) {
                this.bankerHand.addCard(this.deck);
                this.toonKaart(this.bankerHand.cards[this.bankerHand.cards.length - 1], 'kaartenBanker');
            } else if (bs === 4 && [2,3,4,5,6,7].includes(derdeWaarde)) {
                this.bankerHand.addCard(this.deck);
                this.toonKaart(this.bankerHand.cards[this.bankerHand.cards.length - 1], 'kaartenBanker');
            } else if (bs === 5 && [4,5,6,7].includes(derdeWaarde)) {
                this.bankerHand.addCard(this.deck);
                this.toonKaart(this.bankerHand.cards[this.bankerHand.cards.length - 1], 'kaartenBanker');
            } else if (bs === 6 && [6,7].includes(derdeWaarde)) {
                this.bankerHand.addCard(this.deck);
                this.toonKaart(this.bankerHand.cards[this.bankerHand.cards.length - 1], 'kaartenBanker');
            }
        } else {
            // Speler stond → bank trekt bij 0-5
            if (bs <= 5) {
                this.bankerHand.addCard(this.deck);
                this.toonKaart(this.bankerHand.cards[this.bankerHand.cards.length - 1], 'kaartenBanker');
            }
        }

        this.updateScores();
        this.bepaalWinnaar();
    }

    bepaalWinnaar() {
        const ps = this.getHandScore(this.playerHand);
        const bs = this.getHandScore(this.bankerHand);

        let uitslag;
        if (ps > bs) uitslag = 'player';
        else if (bs > ps) uitslag = 'banker';
        else uitslag = 'tie';

        // Uitbetaling
        if (uitslag === this.weddenOp) {
            if (uitslag === 'player') {
                this.chips += this.bet * 2;
                this.toonBericht('🏆 Speler wint! Je wint $' + this.bet, '#4cff72');
            } else if (uitslag === 'banker') {
                const winst = Math.floor(this.bet * 1.95); // 5% commissie
                this.chips += this.bet + winst;
                this.toonBericht('🏆 Bank wint! Je wint $' + winst, '#4cff72');
            } else {
                this.chips += this.bet * 9; // gelijkspel betaalt 8:1
                this.toonBericht('🤝 Gelijkspel! Je wint $' + (this.bet * 8), '#f5c842');
            }
        } else if (uitslag === 'tie' && this.weddenOp !== 'tie') {
            // Bij gelijkspel krijg je je inzet terug als je op speler/bank wedde
            this.chips += this.bet;
            this.toonBericht('🤝 Gelijkspel — inzet terug', '#f5c842');
        } else {
            this.toonBericht('😞 ' + this.getLabelVoor(uitslag) + ' wint. Verloren.', '#ff6b6b');
        }

        this.bet = 0;
        this.weddenOp = null;
        document.querySelectorAll('.wed-knop').forEach(btn => btn.classList.remove('actief'));
        this.gameState = this.chips === 0 ? "gameOver" : "waiting";
        this.updateDisplay();

        if (this.gameState === "gameOver") {
            this.toonBericht('💸 Game Over! Geen chips meer.', '#ff6b6b');
        }
    }
}

var game = new BaccaratGame();

function voegToe(bedrag)       { game.voegToe(bedrag); }
function wisInzet()            { game.wisInzet(); }
function dealCards()           { game.dealCards(); }
function setWeddenOp(keuze)    { game.setWeddenOp(keuze); }