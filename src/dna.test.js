const { selectTraits, createDna } = require('./dna');
const { FourLayers } = require('./__fixtures__/layers');
const { BackgroundBlack_EyeballRed_EyecolorGreen_IrisLarge } = require('./__fixtures__/traits');

describe('dna', () => {
  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  describe('selectTraits', () => {
    it('should select the traits of the artwork', () => {
      expect(selectTraits(FourLayers)).toEqual(BackgroundBlack_EyeballRed_EyecolorGreen_IrisLarge);
    });
  });

  describe('createDna', () => {
    it('should generate and format the DNA with the given traits', () => {
      expect(createDna(BackgroundBlack_EyeballRed_EyecolorGreen_IrisLarge)).toEqual('0:Black#1.png-0:Red#50.png-1:Green#1.png-0:Large#20.png');
    });
  });
});
