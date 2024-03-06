import Phaser from "phaser";
import { GUI } from "dat.gui";

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  balance = 1000;
  balanceText;
  bet = 10;
  betText;

  decreaseBetButton;
  increaseBetButton;

  tourButton;
  buyButton;

  truck;
  truckCanLerp = false;
  truckLerpStep = 0;
  truckPath;

  box;
  boxPath;
  boxGroup = [];

  realTruckLoad = 0;
  currentTruckLoad = 0;
  truckLoadText;
  canUpdateTruckMeter;

  boxLoadSequence = [0, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
  // boxLoadSequence = [0, 0];
  multyplierSequece = [
    1.08, 1.93, 4.14, 11.3, 32.79, 121.95, 250, 1000, 5000, 10000,
  ];

  winChanceSequence = [
    92.47, 52.74, 23.83, 8.86, 3.18, 0.97, 0.28, 0.05, 0.02, 0.01,
  ];

  boxCount = 0;
  boxCountText;
  deleteBoxButton;

  winAmmount = 0;
  winAmmountText;

  potentialWin = 0;
  potentialWinText;

  nextPotentialWin = 0;
  nextPotentialWinText;

  freeBoxText;

  BGMusic;

  playTutorial = false;

  gui = new GUI();
  guiMusic;

  preload() {
    this.loadFont("troika", "assets/troika.otf");

    this.load.baseURL = "assets/";

    this.load.image("BG", "images/Background.png");
    this.load.image("UI", "images/UIV3.png");
    this.load.image("Truck", "images/Truck.png");
    this.load.image("TourButton", "images/TourButton.png");
    this.load.image("BuyButton", "images/BuyButtonV3.png");
    this.load.image("Box", "images/Box.png");
    this.load.image("Success", "images/Success.png");
    this.load.image("Overloaded", "images/Overloaded.png");
    this.load.image("ArrowLeft", "images/ArrowLeft.png");
    this.load.image("ArrowRight", "images/ArrowRight.png");
    this.load.image("DeleteBoxButton", "images/DeleteBoxButton.png");
    this.load.image("TutorialBG", "images/TutorialBG.png");
    this.load.image("TutorialBG2", "images/TutorialBG2.png");
    this.load.image("TutorialBG3", "images/TutorialBG3.png");
    this.load.image(
      "SecondTutorialGraphic",
      "images/SecondTutorialGraphic.png"
    );

    this.load.spritesheet("Truck2", "TruckSpritesheet2.png", {
      frameWidth: 958,
      frameHeight: 558,
    });
    this.load.spritesheet("BoxSheet", "images/BoxSheet4.png", {
      frameWidth: 500,
      frameHeight: 500,
    });

    this.load.audio("BGMusic", ["TradingTycoonBGMusic.mp3"]);
    this.load.audio("AddBox", ["sounds/AddBox.mp3"]);
    this.load.audio("Box", ["sounds/Box.mp3"]);
    this.load.audio("DeleteBox", ["sounds/DeleteBox.mp3"]);
    this.load.audio("Increment", ["sounds/Increment.mp3"]);
    this.load.audio("Decrement", ["sounds/Decrement.mp3"]);
    this.load.audio("AddMoney", ["sounds/AddMoney.mp3"]);
    this.load.audio("BoxFalling", ["sounds/BoxFalling.mp3"]);
    this.load.audio("FreeBox", ["sounds/FreeBox.mp3"]);
    this.load.audio("IncreaseTruckLoad", ["sounds/IncreaseTruckLoad.mp3"]);
    this.load.audio("Overload", ["sounds/Overload.mp3"]);
    this.load.audio("StartTour", ["sounds/StartTour.mp3"]);
    this.load.audio("Success", ["sounds/Success.mp3"]);
  }

  create() {
    this.boxLoadSequence.sort();

    if (this.playTutorial) this.createFirstTutorialScreen();

    this.add.image(-100, -100, "BG").setScale(1.1, 1.1).setOrigin(0, 0);
    this.add.image(0, 3240, "UI").setOrigin(0, 1);

    if (!this.BGMusic || !this.BGMusic.isPlaying) {
      this.BGMusic = this.sound.add("BGMusic", { loop: true, volume: 0.1 });
      this.BGMusic.play();
    }

    this.createTruckPath();

    this.createTruck();

    this.createBoxCountText();

    this.createWinAmmountText();

    this.createBuyButton();
    this.createTourButton();

    this.reloadValues();

    this.createBoxPath();

    this.createUIText();

    this.createBetButtons();

    this.creatDeleteBoxButton();

    this.createPotentialWinText();

    this.createNextPotentialWinText();

    this.createFreeBoxText();

    this.createMinMaxBoxWeightText();

    this.createBoxAnimation();

    this.createSounds();

    // this.guiMusic = this.gui.add(this.BGMusic, "volume", 0, 1, 0.01)
  }

  createSounds() {
    if (!this.AddBoxSound) {
      this.AddBoxSound = this.sound.add("AddBox");
    }
    if (!this.BoxSound) {
      this.BoxSound = this.sound.add("Box");
    }
    if (!this.DeleteBoxSound) {
      this.DeleteBoxSound = this.sound.add("DeleteBox");
    }
    if (!this.IncrementSound) {
      this.IncrementSound = this.sound.add("Increment");
    }
    if (!this.DecrementSound) {
      this.DecrementSound = this.sound.add("Decrement");
    }
    if (!this.AddMoneySound) {
      this.AddMoneySound = this.sound.add("AddMoney");
    }
    if (!this.BoxFallingSound) {
      this.BoxFallingSound = this.sound.add("BoxFalling");
    }
    if (!this.IncreaseTruckLoadSound) {
      this.IncreaseTruckLoadSound = this.sound.add("IncreaseTruckLoad", { loop: true});
    }
    if (!this.OverloadSound) {
      this.OverloadSound = this.sound.add("Overload");
    }
    if (!this.StartTourSound) {
      this.StartTourSound = this.sound.add("StartTour");
    }
    if (!this.SuccessSound) {
      this.SuccessSound = this.sound.add("Success");
    }
    if (!this.FreeBoxSound) {
      this.FreeBoxSound = this.sound.add("FreeBox");
    }
  }

  update(time, delta) {
    this.truckLoadText.x = this.truck.x - 300;
    this.truckLoadText.y = this.truck.y - 150;
  }

  createFirstTutorialScreen() {
    this.tutorialBG = this.add
      .image(0, 0, "TutorialBG")
      .setDepth(30)
      .setOrigin(0, 0);
    this.firstTutorialButton = this.add
      .image(400, 2750, "BuyButton")
      .setDepth(31);
    this.firstTutorialButton.setInteractive();

    this.firstTutorialButton.on("pointerdown", () => {
      this.firstTutorialButton.setAlpha(0.9);
      this.firstTutorialButton.setScale(0.9, 0.9);
    });

    this.firstTutorialButton.on("pointerout", () => {
      this.firstTutorialButton.setAlpha(1);
      this.firstTutorialButton.setScale(1, 1);
    });

    this.firstTutorialButton.on("pointerup", () => {
      this.firstTutorialButton.destroy();
      this.firstTutorialArrow.destroy();
      this.firstTutorialText.destroy();

      this.createSecondTutorialScreen();

      this.firstTutorialButton.setAlpha(1);
      this.firstTutorialButton.setScale(1, 1);
    });

    this.firstTutorialArrow = this.add
      .sprite(370, 2400, "ArrowRight")
      .setDepth(31)
      .setScale(3, 3)
      .setRotation(Math.PI / 2);

    // this.firstTutorialTween = this.add.tween(this.firstTutorialArrow)
    // this.firstTutorialTween

    let text = "Click the button\n to add a box";
    this.firstTutorialText = this.add
      .text(810, 1300, text, {
        fontSize: "170px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 30,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(31);
  }

  createSecondTutorialScreen() {
    this.tutorialBG.setTexture("TutorialBG2");
    this.tutorialBG.setInteractive();
    this.tutorialBG.once("pointerup", () => {
      this.secondTutorualArrow1.destroy();
      this.secondTutorualArrow2.destroy();
      this.secondTutorialText.destroy();

      this.createThirdTutorialScreen();
    });
    this.secondTutorualArrow1 = this.add
      .image(1500, 2300, "ArrowLeft")
      .setDepth(31)
      .setScale(1.2, 1.2);
    this.secondTutorualArrow2 = this.add
      .image(1500, 2400, "ArrowLeft")
      .setDepth(31)
      .setScale(1.2, 1.2);

    let text = "Each box\n encreases Win\nBut\nDecreases chance";
    this.secondTutorialText = this.add
      .text(810, 1300, text, {
        fontSize: "170px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 30,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(31);
  }

  createThirdTutorialScreen() {
    this.tutorialBG.setTexture("TutorialBG3");
    this.tutorialBG.setInteractive();
    this.tutorialBG.once("pointerup", () => {
      this.thirdTutorialText.destroy();
      this.createFourthTutorialScreen();
    });

    let text =
      "Each box weights\n 0 to 120 kg.\nBe careful\n not to overfill the truck";
    this.thirdTutorialText = this.add
      .text(810, 700, text, {
        fontSize: "120px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 30,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(31);
  }

  createFourthTutorialScreen() {
    this.tutorialBG.setTexture("TutorialBG");

    this.fourthTutorialBox = this.add
      .image(600, 700, "Box")
      .setScale(0.7, 0.7)
      .setDepth(31);
    this.fourthTutorialBoxCountText = this.add
      .text(850, 450, "1", {
        fontSize: "90px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      })
      .setDepth(31);

    let text = "You can\nalways delete\nUnvanted boxes";
    this.fourthTutorialText = this.add
      .text(810, 1300, text, {
        fontSize: "170px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 30,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(31);

    this.fourthTutorialArrow = this.add
      .sprite(770, 350, "ArrowRight")
      .setDepth(31)
      .setScale(2, 2)
      .setRotation(Math.PI / 2);

    this.fourthTutorialDeleteBoxButton = this.add
      .image(770, 550, "DeleteBoxButton")
      .setScale(2, 2)
      .setDepth(31);
    this.fourthTutorialDeleteBoxButton.setInteractive();

    this.fourthTutorialDeleteBoxButton.on("pointerdown", () => {
      this.fourthTutorialDeleteBoxButton.setAlpha(0.9);
      this.fourthTutorialDeleteBoxButton.setScale(1.8, 1.8);
    });

    this.fourthTutorialDeleteBoxButton.on("pointerout", () => {
      this.fourthTutorialDeleteBoxButton.setAlpha(1);
      this.fourthTutorialDeleteBoxButton.setScale(2, 2);
    });

    this.fourthTutorialDeleteBoxButton.on("pointerup", () => {
      this.fourthTutorialDeleteBoxButton.setAlpha(1);
      this.fourthTutorialDeleteBoxButton.setScale(2, 2);

      this.fourthTutorialBox.destroy();
      this.fourthTutorialBoxCountText.destroy();
      this.fourthTutorialDeleteBoxButton.destroy();
      this.fourthTutorialText.destroy();
      this.fourthTutorialArrow.destroy();

      this.createFifthTutorialScreen();
    });
  }

  createFifthTutorialScreen() {
    this.tutorialBG.setInteractive();

    this.fifthTutorialButton = this.add
      .image(1150, 2750, "TourButton")
      .setDepth(31);
    this.fifthTutorialButton.setInteractive();

    this.fifthTutorialButton.on("pointerdown", () => {
      this.fifthTutorialButton.setAlpha(0.9);
      this.fifthTutorialButton.setScale(0.9, 0.9);
    });

    this.fifthTutorialButton.on("pointerout", () => {
      this.fifthTutorialButton.setAlpha(1);
      this.fifthTutorialButton.setScale(1, 1);
    });

    this.fifthTutorialButton.on("pointerup", () => {
      this.fifthTutorialButton.setAlpha(1);
      this.fifthTutorialButton.setScale(1, 1);

      this.tutorialBG.destroy();
      this.fifthTutorialButton.destroy();
      this.fifthTutorialText.destroy();
      this.fifthTutorialArrow.destroy();
      this.playTutorial = false;
    });

    let text = "Start the tour\nto test your Luck!";
    this.fifthTutorialText = this.add
      .text(810, 1300, text, {
        fontSize: "170px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 30,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(31);

    this.fifthTutorialArrow = this.add
      .sprite(1140, 2400, "ArrowRight")
      .setDepth(31)
      .setScale(3, 3)
      .setRotation(Math.PI / 2);
  }

  createMinMaxBoxWeightText() {
    this.add.text(
      130,
      2430,
      `${this.boxLoadSequence[0]}-${
        this.boxLoadSequence[this.boxLoadSequence.length - 1]
      } kg`,
      {
        fontSize: "70px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 10,
      }
    );
  }

  createBoxAnimation() {
    this.anims.create({
      key: "BoxApear",
      frames: "BoxSheet",
      repeat: 0,
    });
  }

  createFreeBoxText() {
    this.freeBoxText = this.add.text(250, 900, "FREE BOX!!!", {
      fontSize: "200px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 30,
    });
    this.freeBoxText.setColor("#00ff00");
    this.freeBoxText.setDepth(100);
    this.freeBoxText.setAlpha(0);
  }

  createPotentialWinText() {
    this.potentialWinText = this.add
      .text(900, 2295, "Potential Win", {
        fontSize: "75px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      })
      .setOrigin(0.5, 0.5);
    this.potentialWinText.setColor("#FAC427");
  }

  createNextPotentialWinText() {
    this.nextPotentialWinText = this.add
      .text(900, 2410, "Next Box", {
        fontSize: "75px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      })
      .setOrigin(0.5, 0.5);
    this.nextPotentialWinText.setColor("#D0E0D0");
  }

  updateWinText() {
    if (this.boxGroup.length < 1) {
      this.potentialWinText.text = `Win: ${0}`;

      this.nextPotentialWin = this.winChanceSequence[this.boxCount - 1];
      this.nextPotentialWinText.text = `Chance to Win: ${this.nextPotentialWin.toFixed(
        2
      )}%`;
    } else {
      this.potentialWin =
        this.bet * this.multyplierSequece[this.boxGroup.length - 1];
      this.potentialWinText.text = `Win: ${this.potentialWin.toFixed(2)}`;

      this.nextPotentialWin = this.winChanceSequence[this.boxCount - 1];
      this.nextPotentialWinText.text = `Chance to Win: ${this.nextPotentialWin.toFixed(
        2
      )}%`;
    }
  }

  createBoxPath() {
    // this.graphics = this.add.graphics();
    // this.graphics.lineStyle(10, 0xffffff, 1);

    this.boxPath = new Phaser.Curves.Path(600, 700);
    this.boxPath.lineTo(600, 1600);

    // this.boxPath.draw(this.graphics);
  }

  createTruckPath() {
    // this.graphics = this.add.graphics();
    // this.graphics.lineStyle(10, 0xffffff, 1);

    this.truckPath = new Phaser.Curves.Path(850, 1600);
    this.truckPath.lineTo(3000, 1600);

    // this.truckPath.draw(this.graphics);
  }

  createUIText() {
    this.betText = this.add
      .text(1120, 3065, `${this.bet}`, {
        fontSize: "90px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      })
      .setOrigin(0.5, 0.5);

    this.balanceText = this.add
      .text(390, 3065, `${this.balance.toFixed(2)}`, {
        fontSize: "90px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      })
      .setOrigin(0.5, 0.5);
  }

  createBetButtons() {
    this.decreaseBetButton = this.add.image(940, 3070, "ArrowLeft");
    this.decreaseBetButton.setInteractive();
    this.decreaseBetButton.on("pointerdown", () => {
      this.decreaseBetButton.setAlpha(0.9);
      this.decreaseBetButton.setScale(0.9, 0.9);
    });

    this.decreaseBetButton.on("pointerout", () => {
      this.decreaseBetButton.setAlpha(1);
      this.decreaseBetButton.setScale(1, 1);
    });

    this.decreaseBetButton.on("pointerup", () => {
      this.changeBet(false);

      this.decreaseBetButton.setAlpha(1);
      this.decreaseBetButton.setScale(1, 1);
    });

    this.increaseBetButton = this.add.image(1300, 3070, "ArrowRight");
    this.increaseBetButton.setInteractive();
    this.increaseBetButton.on("pointerdown", () => {
      this.increaseBetButton.setAlpha(0.9);
      this.increaseBetButton.setScale(0.9, 0.9);
    });

    this.increaseBetButton.on("pointerout", () => {
      this.increaseBetButton.setAlpha(1);
      this.increaseBetButton.setScale(1, 1);
    });

    this.increaseBetButton.on("pointerup", () => {
      this.changeBet(true);

      this.increaseBetButton.setAlpha(1);
      this.increaseBetButton.setScale(1, 1);
    });
  }

  changeBet(increase) {
    if (increase) {
      this.bet += 10;
      this.betText.text = `${this.bet}`;
      this.IncrementSound.play();
    } else if (this.bet > 10) {
      this.bet -= 10;
      this.betText.text = `${this.bet}`;
      this.DecrementSound.play();
    }
    this.updateWinText();
  }

  createTruck() {
    this.createTruckAnimaiton();

    this.truck = this.add
      .follower(this.truckPath, 830, 1600, "Truck2")
      .setScale(1.3, 1.3);
    this.truck.setDepth(5);
    this.truckLoadText = this.add
      .text(370, 1400, `${this.currentTruckLoad}/10kg`, {
        fontSize: "80px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      })
      .setOrigin(0.5, 0.5);
    this.truckLoadText.setDepth(6);
  }

  createTruckAnimaiton() {
    this.anims.create({
      key: "TruckDriving",
      frames: "Truck2",
      repeat: -1,
    });
  }

  createBoxCountText() {
    this.boxCountText = this.add.text(850, 450, "", {
      fontSize: "90px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 15,
    });
  }

  createWinAmmountText() {
    this.winAmmountText = this.add.text(810, 1200, "", {
      fontSize: "200px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 30,
    });

    this.winAmmountText.setOrigin(0.5, 0.5);

    this.winAmmountText.setDepth(7);
  }

  createBuyButton() {
    this.buyButton = this.add.image(400, 2750, "BuyButton");
    this.buyButton.setInteractive();

    this.buyButton.on("pointerdown", () => {
      this.buyButton.setAlpha(0.9);
      this.buyButton.setScale(0.9, 0.9);
    });

    this.buyButton.on("pointerout", () => {
      this.buyButton.setAlpha(1);
      this.buyButton.setScale(1, 1);
    });

    this.buyButton.on("pointerup", () => {
      this.createBoxButtonPressed();

      this.buyButton.setAlpha(1);
      this.buyButton.setScale(1, 1);
    });
  }

  createTourButton() {
    this.tourButton = this.add.image(1150, 2750, "TourButton");
    // this.tourButton.setInteractive();
    this.tourButton.setAlpha(0.2);

    this.tourButton.on("pointerdown", () => {
      this.tourButton.setAlpha(0.9);
      this.tourButton.setScale(0.9, 0.9);
    });

    this.tourButton.on("pointerout", () => {
      this.tourButton.setAlpha(1);
      this.tourButton.setScale(1, 1);
    });

    this.tourButton.on("pointerup", () => {
      this.tourButton.setAlpha(1);
      this.tourButton.setScale(1, 1);

      this.startTour();
      this.tourButton.disableInteractive();
    });
  }

  changeBalance(ammount) {
    this.balance += ammount;
    this.balanceText.text = `${this.balance.toFixed(2)}`;
  }

  createBoxButtonPressed() {
    if (this.boxCount === 10) return;
    this.AddBoxSound.play();
    this.spawnBox();
    this.updateBoxCount();
    this.activateActionsForFirstBoughtBox();
    this.updateWinText();
  }

  spawnBox() {
    this.box = this.add
      .follower(this.boxPath, 600, 700, "BoxSheet")
      .setScale(0.7, 0.7);

    this.box.play("BoxApear");
    let loadIndex = Phaser.Math.Between(0, this.boxLoadSequence.length - 1);
    this.boxGroup.push({
      gameObject: this.box,
      canLerp: false,
      lerpStep: 0,
      weight: this.boxLoadSequence[loadIndex],
    });
  }

  updateBoxCount() {
    this.boxCount++;
    this.boxCountText.text = this.boxCount;
  }

  activateActionsForFirstBoughtBox() {
    if (this.boxCount == 1) {
      this.deleteBoxButton.setAlpha(1);
      this.tourButton.setInteractive();
      this.tourButton.setAlpha(1);
    }
  }

  creatDeleteBoxButton() {
    this.deleteBoxButton = this.add
      .image(770, 550, "DeleteBoxButton")
      .setScale(2, 2);
    this.deleteBoxButton.setInteractive();

    this.deleteBoxButton.on("pointerdown", () => {
      this.deleteBoxButton.setAlpha(0.9);
      this.deleteBoxButton.setScale(1.8, 1.8);
    });

    this.deleteBoxButton.on("pointerout", () => {
      this.deleteBoxButton.setAlpha(1);
      this.deleteBoxButton.setScale(2, 2);
    });

    this.deleteBoxButton.on("pointerup", () => {
      this.deleteBoxButton.setAlpha(1);
      this.deleteBoxButton.setScale(2, 2);

      this.deleteBox();
    });

    this.deleteBoxButton.setDepth(8);

    this.deleteBoxButton.setAlpha(0);
  }

  deleteBox() {
    this.DeleteBoxSound.play();
    this.boxGroup[this.boxGroup.length - 1].gameObject.destroy();
    this.boxGroup.pop();
    this.boxCount--;
    this.boxCountText.text = this.boxCount;
    if (this.boxCount === 0) {
      this.deleteBoxButton.setAlpha(0);
      this.tourButton.disableInteractive();
      this.tourButton.setAlpha(0.2);
    }
    this.updateWinText();
  }

  startBoxLoading() {
    this.boxCount--;
    if (this.boxCount <= -1) {
      this.time.delayedCall(600, () => {
        if (this.currentTruckLoad <= 100) this.moveTruck();
      });
      this.roundFinished();
    } else {
      if (this.currentTruckLoad <= 100) this.LoadNextBox();
    }
  }

  LoadNextBox() {
    this.BoxFallingSound.play();
    this.boxCountText.text = this.boxCount;
    this.boxGroup[this.boxCount].gameObject.startFollow({
      duration: 1000,
      loop: 0,
      onComplete: () => {
        this.time.delayedCall(100, () => {
          this.fillTruckLoadMeter(this.boxGroup[this.boxCount].weight);
        });
        this.boxGroup[this.boxCount].gameObject.destroy();
      },
    });
  }

  moveTruck() {
    this.StartTourSound.play()
    this.truck.play("TruckDriving");
    this.truck.startFollow({
      duration: 2000,
      loop: 0,
      onComplete: () => {
        this.showWin();
        this.truckCanLerp = false;
        this.truckLerpStep = 0;
      },
    });
  }

  fillTruckLoadMeter(boxWeight) {
    if (boxWeight === 0) {
      this.ZeroWeightBoxLoaded();
    }
    else{
      this.realTruckLoad += boxWeight;
      let loadDifference = this.realTruckLoad - this.currentTruckLoad;
      this.IncreaseTruckLoadSound.play()
      for (let i = 0; i < loadDifference; i++) {
        this.time.delayedCall(20 * i, () => {
          this.currentTruckLoad++;
  
          this.truckLoadText.text = `${this.currentTruckLoad}/100kg`;
  
          if (i === loadDifference - 1) {
            this.IncreaseTruckLoadSound.stop()
            if (this.currentTruckLoad > 100) {
              this.roundFinished();
              this.truckLoadText.setColor("#ff0000");
              this.truckLoadText.setScale(1.1, 1.1);
            } else {
              this.truckLoadText.setColor("#00ff00");
              this.truckLoadText.setScale(1.1, 1.1);
            }
  
            this.time.delayedCall(500, () => {
              this.truckLoadText.setColor("#ffffff");
              this.truckLoadText.setScale(1, 1);
  
              this.startBoxLoading();
            });
          }
        });
      }
    }
    
  }

  ZeroWeightBoxLoaded() {
    this.FreeBoxSound.play()
    this.freeBoxText.setAlpha(1);
    this.truckLoadText.setColor("#00ff00");
    this.truckLoadText.setScale(1.2, 1.2);
    this.time.delayedCall(1000, () => {
      this.truckLoadText.setColor("#ffffff");
      this.truckLoadText.setScale(1, 1);
      this.startBoxLoading();
      this.freeBoxText.setAlpha(0);
      
    });
  }

  startTour() {
    if (this.boxCount === 0) return;

    // this.StartTourSound.play();

    this.deleteBoxButton.setAlpha(0);
    this.startBoxLoading();
    this.changeBalance(-this.bet);
  }

  showWin() {
    let multiplier = this.multyplierSequece[this.boxGroup.length - 1];

    this.winAmmount = multiplier * this.bet;
    this.winAmmountText.text = `Win: ${this.winAmmount.toFixed(2)}`;
    this.changeBalance(this.winAmmount);
    this.AddMoneySound.play();
  }

  roundFinished() {
    this.boxCountText.text = "";

    if (this.currentTruckLoad <= 100) {
      this.SuccessSound.play();
      this.add
        .image(750, 700, "Success")
        .setScale(0.7, 0.7)
        .setOrigin(0.5, 0.5);

      this.time.delayedCall(200, () => {
        this.truckCanLerp = true;

        this.time.delayedCall(4000, () => {
          this.scene.restart();
          // this.BGMusic.stop();
          // this.gui.remove(this.guiMusic);
        });
      });
    } else {
      this.OverloadSound.play();
      this.add
        .image(750, 700, "Overloaded")
        .setScale(0.6, 0.6)
        .setOrigin(0.5, 0.5);

      this.time.delayedCall(1500, () => {
        this.scene.restart();
        // this.BGMusic.stop();
        // this.gui.remove(this.guiMusic);
      });
    }
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  reloadValues() {
    this.truckCanLerp = false;
    this.truckLerpStep = 0;

    this.boxGroup = [];

    this.realTruckLoad = 0;
    this.currentTruckLoad = 0;
    this.truckLoadText.text = "0/100kg";

    this.boxLoadSequence = [0, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

    this.boxCount = 0;

    this.winAmmount = 0;
  }

  loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont
      .load()
      .then(function (loaded) {
        document.fonts.add(loaded);
      })
      .catch(function (error) {
        return error;
      });
  }
}
