const { ethers } = require('hardhat');
const { expect } = require('chai');


describe('Founding Fathers', async ()=> {
    let deployer, transaction, result, FF, FF2;

    beforeEach(async () => {
      const FoundingFathers = await ethers.getContractFactory('FoundingFathers');
      const FoundingFathersLevelTwo = await ethers.getContractFactory('FoundingFathersLevelTwo');
      const FoundingFathersLevelThree = await ethers.getContractFactory('FoundingFathersLevelThree');
      const FoundingFathersLevelFour = await ethers.getContractFactory('FoundingFathersLevelFour');
      const FoundingFathersLevelFive = await ethers.getContractFactory('FoundingFathersLevelFive');
      accounts = await ethers.getSigners();
      deployer = accounts[0];
      minter = accounts[1];
      user2 = accounts[2];
      FF = await FoundingFathers.deploy();
      FF2 = await FoundingFathersLevelTwo.deploy();
      FF3 = await FoundingFathersLevelThree.deploy();
      FF4 = await FoundingFathersLevelFour.deploy();
      FF5 = await FoundingFathersLevelFive.deploy();
    })

  describe('Minting Tokens Level One', async () => {
    it('Mint Function Works: Mints To Owner', async() => {
      await FF.connect(deployer).safeMint(deployer.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
      expect(await FF.balanceOf(deployer.address)).to.equal(1);      
    })
    it('Mint Function Works: Mints To Minter', async() => {
      await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
      expect(await FF.balanceOf(minter.address)).to.equal(1);      
    })
    it('Emits Transfer Function when Minting', async() => {
      transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
      result = await transaction.wait()
      expect(result.events[0].event).to.equal('Transfer')
      expect(result.events[0].args['from']).to.equal(ethers.constants.AddressZero)
      expect(result.events[0].args['to']).to.equal(minter.address)
    })
   })
  describe('Burning Tokens/Minting Tokens Level Two Through Five', async () => {

    let transaction, result;

    beforeEach(async () => {
        transaction = await FF.connect(deployer).setLevelTwoContractAddress(FF2.address)
        result = await transaction.wait();

        transaction = await FF2.connect(deployer).setLevelOneContractAddress(FF.address)
        result = await transaction.wait();    

        transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
        result = await transaction.wait();

        transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
        result = await transaction.wait();

        transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
        result = await transaction.wait();        
    })

    describe('Burn Function', async () => {
      it('Burns a Token', async () => {
        await FF.connect(minter).publicBurn(0)
        expect(await FF.viewAmountBurned(minter.address)).to.equal(1);
      })
      it('Fails to Burn when not called from owner of Token', async () => {
        expect(await FF.connect(deployer).publicBurn(1)).to.be.reverted;
      })  
    })
    describe('2nd Level Minting', async () => {

      let transaction, result;

      beforeEach(async () => {
          transaction = await FF.connect(deployer).setLevelTwoContractAddress(FF2.address)
          result = await transaction.wait();

          transaction = await FF2.connect(deployer).setLevelOneContractAddress(FF.address)
          result = await transaction.wait();    

          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          result = await transaction.wait();

          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          result = await transaction.wait();

          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          result = await transaction.wait();

          await FF.connect(minter).publicBurn(0)
          await FF.connect(minter).publicBurn(1)
          await FF.connect(minter).publicBurn(2)        
      })
      it('Mint Function Works: Mints To Minter, 2nd Level', async() => {
        await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
        expect(await FF2.balanceOf(minter.address)).to.equal(1);      
      })
      it('Emits Transfer Function when Minting, 2nd Level', async() => {
        transaction = await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()
        expect(result.events[0].event).to.equal('Transfer')
        expect(result.events[0].args['from']).to.equal(ethers.constants.AddressZero)
        expect(result.events[0].args['to']).to.equal(minter.address)
      })
      it('Does Not Mint when Address hasnt burned two tokens', async() => {
        await expect(FF2.connect(deployer).safeMint(deployer.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")).to.be.reverted
      })
      it('Should Decrement Tokens Burned By 2 when Minting', async() => {
        expect(await FF.viewAmountBurned(minter.address)).to.equal(3)  

        transaction = await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()

        expect(await FF.viewAmountBurned(minter.address)).to.equal(1)
      })
   })
   describe('3rd Level Minting', async () => {

      let transaction, result;

      beforeEach(async () => {
          transaction = await FF.connect(deployer).setLevelTwoContractAddress(FF2.address)
          result = await transaction.wait();

          transaction = await FF2.connect(deployer).setLevelOneContractAddress(FF.address)
          result = await transaction.wait();

          transaction = await FF2.connect(deployer).setLevelThreeContractAddress(FF3.address)
          result = await transaction.wait();

          transaction = await FF3.connect(deployer).setLevelTwoContractAddress(FF2.address)
          result = await transaction.wait();    

          //minting Six Level One NFTs
          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");

          //Burning Three Level One NFTs
          await FF.connect(minter).publicBurn(0)
          await FF.connect(minter).publicBurn(1)
          await FF.connect(minter).publicBurn(2)
          await FF.connect(minter).publicBurn(3)
          await FF.connect(minter).publicBurn(4)
          await FF.connect(minter).publicBurn(5)

          //Minting Three Level Two NFTs
          transaction = await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
          transaction = await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");

          //Burning Three Level Two NFTs
          await FF2.connect(minter).publicBurn(0)
          await FF2.connect(minter).publicBurn(1)
          await FF2.connect(minter).publicBurn(2)
      })

      it('Mint Function Works: Mints To Minter, 3rd Level', async() => {
        await FF3.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
        expect(await FF3.balanceOf(minter.address)).to.equal(1);      
      })
      it('Emits Transfer Function when Minting, 3rd Level', async() => {
        transaction = await FF3.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()
        expect(result.events[0].event).to.equal('Transfer')
        expect(result.events[0].args['from']).to.equal(ethers.constants.AddressZero)
        expect(result.events[0].args['to']).to.equal(minter.address)
      })
      it('Does Not Mint when Address hasnt burned two tokens', async() => {
        await expect(FF3.connect(deployer).safeMint(deployer.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")).to.be.reverted
      })
      it('Should Decrement Tokens Burned By 2 when Minting', async() => {
        expect(await FF2.viewAmountBurned(minter.address)).to.equal(3)  

        transaction = await FF3.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()

        expect(await FF2.viewAmountBurned(minter.address)).to.equal(1)
      })
    })
   describe('4th Level Minting', async () => {

      let transaction, result;

      beforeEach(async () => {
          transaction = await FF.connect(deployer).setLevelTwoContractAddress(FF2.address)
          result = await transaction.wait();

          transaction = await FF2.connect(deployer).setLevelOneContractAddress(FF.address)
          result = await transaction.wait();

          transaction = await FF2.connect(deployer).setLevelThreeContractAddress(FF3.address)
          result = await transaction.wait();

          transaction = await FF3.connect(deployer).setLevelTwoContractAddress(FF2.address)
          result = await transaction.wait();

          transaction = await FF3.connect(deployer).setLevelFourContractAddress(FF4.address)
          result = await transaction.wait();

          transaction = await FF4.connect(deployer).setLevelThreeContractAddress(FF3.address)
          result = await transaction.wait();

          //minting 24 Level One NFTs
          for(var i = 0; i < 24; i++){
            await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");  
          }
          
          //Burning 24 Level One NFTs
          for(var j = 0; j < 24; j++){
            await FF.connect(minter).publicBurn(j)
          }

          //Minting 12 Level Two NFTs
          for(var k = 0; k < 12; k++){
            await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");  
          }

          //Burning 12 Level Two NFTs
          for(var l = 0; l < 12; l++){
            await FF2.connect(minter).publicBurn(l)
          }
          
          //Minting Six Level Three NFTs
          for(var m = 0; m < 6; m++){
            await FF3.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
          }

          //Burning Six Level Three NFTs
          for(var n = 0; n < 6; n++){
            await FF3.connect(minter).publicBurn(n)
          }
          
      })

      it('Mint Function Works: Mints To Minter, 4th Level', async() => {
        await FF4.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
        expect(await FF4.balanceOf(minter.address)).to.equal(1);      
      })
      it('Emits Transfer Function when Minting, 4th Level', async() => {
        transaction = await FF4.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()
        expect(result.events[0].event).to.equal('Transfer')
        expect(result.events[0].args['from']).to.equal(ethers.constants.AddressZero)
        expect(result.events[0].args['to']).to.equal(minter.address)
      })
      it('Does Not Mint when Address hasnt burned two tokens', async() => {
        await expect(FF4.connect(deployer).safeMint(deployer.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")).to.be.reverted
      })
      it('Should Decrement Tokens Burned By 5 when Minting', async() => {
        expect(await FF3.viewAmountBurned(minter.address)).to.equal(6)  

        transaction = await FF4.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()

        expect(await FF3.viewAmountBurned(minter.address)).to.equal(1)
      })
    })
   describe('5th Level Minting', async () => {

      let transaction, result;

      beforeEach(async () => {
          transaction = await FF.connect(deployer).setLevelTwoContractAddress(FF2.address)
          result = await transaction.wait();

          transaction = await FF2.connect(deployer).setLevelOneContractAddress(FF.address)
          result = await transaction.wait();

          transaction = await FF2.connect(deployer).setLevelThreeContractAddress(FF3.address)
          result = await transaction.wait();

          transaction = await FF3.connect(deployer).setLevelTwoContractAddress(FF2.address)
          result = await transaction.wait();

          transaction = await FF3.connect(deployer).setLevelFourContractAddress(FF4.address)
          result = await transaction.wait();

          transaction = await FF4.connect(deployer).setLevelThreeContractAddress(FF3.address)
          result = await transaction.wait();

          transaction = await FF4.connect(deployer).setLevelFiveContractAddress(FF5.address)
          result = await transaction.wait();

          transaction = await FF5.connect(deployer).setLevelFourContractAddress(FF4.address)
          result = await transaction.wait();

          //minting 250 Level One NFTs
          for(var i = 0; i < 220; i++){
            await FF.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");  
          }
          
          //Burning 250 Level One NFTs
          for(var j = 0; j < 220; j++){
            await FF.connect(minter).publicBurn(j)
          }

          //Minting 125 Level Two NFTs
          for(var k = 0; k < 110; k++){
            await FF2.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");  
          }

          //Burning 110 Level Two NFTs
          for(var l = 0; l < 110; l++){
            await FF2.connect(minter).publicBurn(l)
          }
          
          //Minting 55 Level Three NFTs
          for(var m = 0; m < 55; m++){
            await FF3.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
          }

          //Burning 55 Level Three NFTs
          for(var n = 0; n < 55; n++){
            await FF3.connect(minter).publicBurn(n)
          }
          
          //Minting 11 Level Four NFTs
          for(var m = 0; m < 11; m++){
            await FF4.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
          }

          //Burning 11 Level Four NFTs
          for(var n = 0; n < 11; n++){
            await FF4.connect(minter).publicBurn(n)
          }
      })

      it('Mint Function Works: Mints To Minter, 5th Level', async() => {
        expect(await FF4.viewAmountBurned(minter.address)).to.equal(11)
        await FF5.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7");
        expect(await FF5.balanceOf(minter.address)).to.equal(1);      
      })
      it('Emits Transfer Function when Minting, 5th Level', async() => {
        transaction = await FF5.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()
        expect(result.events[0].event).to.equal('Transfer')
        expect(result.events[0].args['from']).to.equal(ethers.constants.AddressZero)
        expect(result.events[0].args['to']).to.equal(minter.address)
      })
      it('Does Not Mint when Address hasnt burned two tokens', async() => {
        await expect(FF5.connect(deployer).safeMint(deployer.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")).to.be.reverted
      })
      it('Should Decrement Tokens Burned By 10 when Minting', async() => {
        expect(await FF4.viewAmountBurned(minter.address)).to.equal(11)  

        transaction = await FF5.connect(deployer).safeMint(minter.address, "ipfs://QmcRdZYe9Du31EkSMLUCWJ1UPZGAFm6d1YoCiVh9V8W6D7")
        result = await transaction.wait()

        expect(await FF4.viewAmountBurned(minter.address)).to.equal(1)
      })
    })
   })
})
