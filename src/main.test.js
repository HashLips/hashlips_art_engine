const { startCreating } = require('./main');
const { isDnaUnique, createDna  } = require('./dna');
const { needsExclusion } = require('./exclusions');

jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');

  return {
    ...originalModule,
    mkdirSync: () => {},
    writeFileSync: () => {},
    readdirSync: () => (['a.png', 'b.png']),
  };
});

jest.mock('canvas', () => {
  const originalModule = jest.requireActual('canvas');

  return {
    ...originalModule,
    createCanvas: jest.fn(() => ({
      getContext: jest.fn(() => ({
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        drawImage: jest.fn(),
      })),
      toBuffer: jest.fn(),
    })),
    loadImage: jest.fn(() => ({})),
  };
});

jest.mock('./config', () => {
  const originalConfig = jest.requireActual('./config');
  const configOverrides = require('./__fixtures__/config_overrides');

  return {
    ...originalConfig,
    ...configOverrides,
  };
});

jest.mock('./dna', () => {
  const originalModule = jest.requireActual('./dna');

  return {
    ...originalModule,
    createDna: jest.fn(originalModule.createDna),
    isDnaUnique: jest.fn(() => true),
  };
});

jest.mock('./exclusions', () => ({
  needsExclusion: jest.fn(() => false),
}));

describe('main', () => {
  const originalConsoleObject = global.console;

  beforeAll(() => {
    global.console.log = () => {};
  });

  afterAll(() => {
    global.console = originalConsoleObject;
  });

  afterEach(() => {
    jest.clearAllMocks()
  });

  describe('startCreating', () => {
    it('should run the creating correctly', async () => {
      await startCreating();
    });

    it('should not skip the generation of any artwork if all restrictions are fulfilled', async () => {
      await startCreating();

      expect(createDna).toHaveBeenCalledTimes(5);
    });

    it('should skip the generation of a piece of artwork if the DNA already exists', async () => {
      isDnaUnique.mockImplementationOnce(() => false);

      await startCreating();

      expect(createDna).toHaveBeenCalledTimes(6);
    });

    it('should skip the generation of a piece of artwork if according to the configuration it needs exclusion', async () => {
      needsExclusion.mockImplementationOnce(() => true);

      await startCreating();

      expect(createDna).toHaveBeenCalledTimes(6);
    });
  });
});
