import { Component } from '@angular/core';

class Round {
  public firstHit: number = -1;
  public secondHit: number = -1;
  public thirdHit?: number = -1;
  public total: number = 0;
  public shownSum: number = 0;
  public strike: boolean = false;
  public spare: boolean = false;
  public open: boolean = false;
  public specialHits: number = 0;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title: string = 'bowling-challenge';
  public choices: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public rounds: Round[] = [
    new Round(),
    new Round(),
    new Round(),
    new Round(),
    new Round(),
    new Round(),
    new Round(),
    new Round(),
    new Round(),
    new Round()
  ];
  public sum: number = 0;
  public currentRound: number = 0;
  public firstThrow: boolean = true;
  public finalThrow: number = 0;
  public endText: string = '';

  private CheckSpecials() {
    let roundData = this.rounds[this.currentRound];
    // ----- Update round outcome ----- //
    // If all 10 pins are hit first time: Strike
    if (this.firstThrow === true && roundData.firstHit === 10) {
      roundData.firstHit = -1;
      roundData.secondHit = 10;
      roundData.strike = true;
      roundData.specialHits += 2;
    }

    // If both shots are total 10 pins: Spare
    if (this.firstThrow === false
      && roundData.firstHit + roundData.secondHit === 10
      && roundData.firstHit >= 0
      && roundData.secondHit >= 0) {
      roundData.spare = true;
      roundData.specialHits += 1;
    }

    // If neither strikes equal 10 pins: Open Frame
    if (roundData.firstHit + roundData.secondHit < 10
      && roundData.firstHit >= 0
      && roundData.secondHit >= 0) {
      roundData.open = true;
    }
  }

  private CalculateSpecials(value: number) {
    let roundData = this.rounds[this.currentRound];

    // ----- Update round total ----- //
    try {
      roundData.total += value;
      let lastRound = this.rounds[this.currentRound - 1];
      let secondLastRound = this.rounds[this.currentRound - 2];

      // If last was a strike or spare add to the total of it
      if (lastRound.specialHits > 0 && (lastRound.strike || lastRound.spare)) {
        lastRound.total += value;
        lastRound.shownSum += value;
        lastRound.specialHits--;
      }

      // If second last was a strike add to that
      if (lastRound.specialHits > 0 && secondLastRound.strike) {
        secondLastRound.total += value;
        secondLastRound.shownSum += value;
        secondLastRound.specialHits--;
      }
    } catch (err) { }
  }

  private CalculateRounds() {
    let roundData = this.rounds[this.currentRound];

    // Update total based on sum of all totals
    let sum = 0;
    this.rounds.forEach((x, index) => {
      sum += x.total;

      // Let the current round totals be the sum of all before them
      let currentShownTotal = 0;
      for (let i = 0; i < index + 1; i++) {
        currentShownTotal += this.rounds[i].total;
      };
      this.rounds[index].shownSum = currentShownTotal;
    });

    this.sum = sum;
    roundData.shownSum = sum;
  }

  public ChoosePins(value: number) {

    let roundData = this.rounds[this.currentRound];
    let isFirstThrow = false;

    if (this.currentRound !== 9) {
      // ----- Change throws ----- //
      // If first throw, update first value
      if (this.firstThrow === true) {
        roundData.firstHit = value;
        roundData.total = 0;
        // Also update throw state
        isFirstThrow = false;
      }
      // If second throw, update second value
      if (this.firstThrow === false) {
        roundData.secondHit = value;
        // Also update throw state
        isFirstThrow = true;
      }

      // Check for strikes, spares, and open frames
      this.CheckSpecials();

      // Check previous rounds for strikes and spares, and add values to them
      this.CalculateSpecials(value);

      // End round
      if (roundData.strike || roundData.spare || roundData.open) {
        isFirstThrow = true;
        this.currentRound++;
        this.choices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      } else {
        let choicesLeft = 11 - value;
        this.choices = Array.from(Array(choicesLeft).keys());
      }

      // Calculate all rounds based on current values
      this.CalculateRounds();

      // Update throw after checks
      this.firstThrow = isFirstThrow;
    } else {
      // <-------- The 10th Frame --------> //
      let endGame = false;

      if (this.finalThrow === 0) {
        roundData.firstHit = value;
        let choicesLeft = 11 - value;
        this.choices = Array.from(Array(choicesLeft).keys());
      } else if (this.finalThrow === 1) {
        roundData.secondHit = value;
        this.choices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      } else if (this.finalThrow === 2) {
        roundData.thirdHit = value;
        this.choices = [];
      }

      // If 10 pins hit first roll: Strike
      if (this.finalThrow === 0
        && value === 10
        && this.firstThrow === true) {
        this.choices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        roundData.firstHit = value;
      }

      // If less than 10 pins hit with 2 rolls: End Game
      if (this.finalThrow === 1
        && roundData.firstHit + roundData.secondHit < 10) {
        endGame = true;
      }

      // Check previous rounds for strikes and spares, and add values to them
      this.CalculateSpecials(value);

      // Calculate all rounds based on current values
      this.CalculateRounds();

      if (this.finalThrow === 2 || endGame) {
        roundData.total = roundData.shownSum;
        roundData.shownSum = roundData.total;
        this.sum = roundData.shownSum;
        this.choices = [];
        this.endText = "Game Over! Your total is: " + roundData.total;
      }

      // Change final turn
      this.finalThrow++;
    }
  }
}