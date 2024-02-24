import Phaser from "phaser";

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
  multyplierSequece = [
    1.08, 1.93, 4.14, 11.3, 32.79, 121.95, 250, 1000, 5000, 10000,
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

  preload() {
    this.loadFont("troika", "assets/troika.otf");

    this.load.baseURL = "assets/";

    this.load.image("BG", "Background.png");
    this.load.image("UI", "UIV3.png");
    this.load.image("Truck", "Truck.png");
    this.load.image("TourButton", "TourButton.png");
    this.load.image("BuyButton", "BuyButton.png");
    this.load.image("Box", "Box.png");
    this.load.image("Success", "Success.png");
    this.load.image("Overloaded", "Overloaded.png");
    this.load.image("ArrowLeft", "ArrowLeft.png");
    this.load.image("ArrowRight", "ArrowRight.png");
    this.load.image("DeleteBoxButton", "DeleteBoxButton.png");
    this.load.spritesheet("Truck2", "TruckSpritesheet2.png", {
      frameWidth: 958,
      frameHeight: 558,
    });
    this.load.spritesheet("BoxSheet", "BoxSheet4.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
  }

  create() {
    this.boxLoadSequence.sort();

    this.add.image(-100, -100, "BG").setScale(1.1, 1.1).setOrigin(0, 0);
    this.add.image(0, 3240, "UI").setOrigin(0, 1);

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

    this.createBoxAnimaiton();
  }

  update(time, delta) {
    this.truckLoadText.x = this.truck.x - 300
    this.truckLoadText.y = this.truck.y - 150
    
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

  createBoxAnimaiton() {
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
    this.potentialWinText = this.add.text(900, 2295, "Potential Win", {
      fontSize: "70px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 15,
    }).setOrigin(0.5, 0.5);
  }

  createNextPotentialWinText() {
    this.nextPotentialWinText = this.add.text(900, 2410, "Next Box", {
      fontSize: "70px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 15,
    }).setOrigin(0.5, 0.5);
    this.nextPotentialWinText.setColor("#39ff14");
  }

  updateWinText() {
    if (this.boxGroup.length < 1) {
      this.potentialWinText.text = `Win: ${0}`;

      this.nextPotentialWin = this.bet * this.multyplierSequece[0];
      this.nextPotentialWinText.text = `Next Win: ${this.nextPotentialWin.toFixed(
        2
      )}`;
    } else {
      this.potentialWin =
        this.bet * this.multyplierSequece[this.boxGroup.length - 1];
      this.potentialWinText.text = `Win: ${this.potentialWin.toFixed(2)}`;

      this.nextPotentialWin =
        this.bet * this.multyplierSequece[this.boxGroup.length];
      this.nextPotentialWinText.text = `Next Win: ${this.nextPotentialWin.toFixed(
        2
      )}`;
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
    this.betText = this.add.text(1120, 3065, `${this.bet}`, {
      fontSize: "90px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 15,
    }).setOrigin(0.5, 0.5);

    this.balanceText = this.add.text(390, 3065, `${this.balance.toFixed(2)}`, {
      fontSize: "90px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 15,
    }).setOrigin(0.5, 0.5);
  }

  createBetButtons() {
    this.decreaseBetButton = this.add
      .image(940, 3070, "ArrowLeft")
      .setScale(0.4, 0.4);
    this.decreaseBetButton.setInteractive();
    this.decreaseBetButton.on("pointerdown", () => {
      this.changeBet(false);
    });

    this.increaseBetButton = this.add
      .image(1300, 3070, "ArrowRight")
      .setScale(0.4, 0.4);
    this.increaseBetButton.setInteractive();
    this.increaseBetButton.on("pointerdown", () => {
      this.changeBet(true);
    });
  }

  changeBet(increase) {
    if (increase) {
      this.bet += 10;
      this.betText.text = `${this.bet}`;
    } else {
      this.bet -= 10;
      this.betText.text = `${this.bet}`;
    }
    this.updateWinText();
  }

  createTruck() {
    this.createTruckAnimaiton();

    this.truck = this.add
      .follower(this.truckPath, 830, 1600, "Truck2")
      .setScale(1.3, 1.3);
    this.truck.setDepth(5);
    this.truckLoadText = this.add.text(
      370,
      1400,
      `${this.currentTruckLoad}/10kg`,
      {
        fontSize: "80px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      }
    ).setOrigin(0.5, 0.5);
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
      this.createBoxButtonPressed();
    });
  }

  createTourButton() {
    this.tourButton = this.add.image(1150, 2750, "TourButton");
    this.tourButton.setInteractive();
    this.tourButton.on("pointerdown", () => {
      this.startTour();
    });
  }

  changeBalance(ammount) {
    this.balance += ammount;
    this.balanceText.text = `${this.balance.toFixed(2)}`;
  }

  createBoxButtonPressed() {
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
    }
  }

  creatDeleteBoxButton() {
    this.deleteBoxButton = this.add
      .image(770, 550, "DeleteBoxButton")
      .setScale(2, 2);
    this.deleteBoxButton.setInteractive();
    this.deleteBoxButton.on("pointerdown", () => {
      this.deleteBox();
    });
    this.deleteBoxButton.setDepth(8);

    this.deleteBoxButton.setAlpha(0);
  }

  deleteBox() {
    this.boxGroup[this.boxGroup.length - 1].gameObject.destroy();
    this.boxGroup.pop();
    this.boxCount--;
    this.boxCountText.text = this.boxCount;
    if (this.boxCount === 0) {
      this.deleteBoxButton.setAlpha(0);
    }
    this.updateWinText();
  }

  startBoxLoading() {
    this.boxCount--;
    if (this.boxCount <= -1) {
      this.time.delayedCall(600, () => {
        
        this.moveTruck();
      });
      this.roundFinished();
    } else {
      this.LoadNextBox();
    }
  }

  LoadNextBox() {
    this.boxCountText.text = this.boxCount;
    this.boxGroup[this.boxCount].gameObject.startFollow({
      duration: 1000,
      loop: 0,
      onComplete: () => {
        this.boxGroup[this.boxCount].gameObject.destroy();
        this.fillTruckLoadMeter(this.boxGroup[this.boxCount].weight);
      },
    });
  }

  moveTruck() {
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

    this.realTruckLoad += boxWeight;
    let loadDifference = this.realTruckLoad - this.currentTruckLoad;
    for (let i = 0; i < loadDifference; i++) {
      this.time.delayedCall(20 * i, () => {
        this.currentTruckLoad++;

        this.truckLoadText.text = `${this.currentTruckLoad}/100kg`;

        if (this.currentTruckLoad > 100) {
          this.roundFinished();
        }

        if (i === loadDifference - 1) {
          this.time.delayedCall(500, () => {

            this.startBoxLoading();
          })
        }
      });
    }
  }

  ZeroWeightBoxLoaded() {
    this.freeBoxText.setAlpha(1);

    this.time.delayedCall(1000, () => {
      this.startBoxLoading();
      this.freeBoxText.setAlpha(0);
    });
  }

  startTour() {
    if (this.boxCount === 0) return;
    this.deleteBoxButton.setAlpha(0);
    this.startBoxLoading();
    this.changeBalance(-this.bet);
  }

  showWin() {
    let multiplier = this.multyplierSequece[this.boxGroup.length - 1];

    this.winAmmount = multiplier * this.bet;
    this.winAmmountText.text = `Win: ${this.winAmmount.toFixed(2)}`;
    this.changeBalance(this.winAmmount);
  }

  roundFinished() {
    this.boxCountText.text = "";

    if (this.currentTruckLoad <= 100) {
      this.add
        .image(750, 700, "Success")
        .setScale(0.7, 0.7)
        .setOrigin(0.5, 0.5);

      this.time.delayedCall(200, () => {
        this.truckCanLerp = true;

        this.time.delayedCall(4000, () => {
          this.scene.restart();
        });
      });
    } else {
      this.add
        .image(750, 700, "Overloaded")
        .setScale(0.6, 0.6)
        .setOrigin(0.5, 0.5);

      this.time.delayedCall(1500, () => {
        this.scene.restart();
      });
      // this.scene.pause();
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
