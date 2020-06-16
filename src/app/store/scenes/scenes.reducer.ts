import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ScenesActionType, ScenesActions } from './scenes.action';

import { CMRProduct, UnzippedFolder, ColumnSortDirection, SearchType, CMRProductPair } from '@models';

interface SceneEntities { [id: string]: CMRProduct; }

export interface ScenesState {
  ids: string[];
  products: SceneEntities;
  customPairs: CMRProductPair[];
  selectedPair: string[] | null;
  areResultsLoaded: boolean;
  scenes: {[id: string]: string[]};
  unzipped: {[id: string]: UnzippedFolder[]};
  openUnzippedProduct: string | null;
  productUnzipLoading: string | null;
  selected: string | null;
  master: string | null;
  filterMaster: string | null;
  masterOffsets: {
    temporal: number;
    perpendicular: number
  };
  perpendicularSort: ColumnSortDirection;
  temporalSort: ColumnSortDirection;
}

export const initState: ScenesState = {
  ids: [],
  scenes: {},
  customPairs: [],
  selectedPair: null,
  unzipped: {},
  productUnzipLoading: null,
  openUnzippedProduct: null,
  products: {},
  areResultsLoaded: false,

  selected: null,
  master: null,
  filterMaster: null,
  masterOffsets: {
    temporal: 0,
    perpendicular: 0
  },
  perpendicularSort: ColumnSortDirection.NONE,
  temporalSort: ColumnSortDirection.NONE,
};


export function scenesReducer(state = initState, action: ScenesActions): ScenesState {
  switch (action.type) {
    case ScenesActionType.SET_SCENES: {
      const products = action.payload.products
        .reduce((total, product) => {
          total[product.id] = product;

          return total;
        }, {});

      const productGroups: {[id: string]: string[]} = action.payload.products.reduce((total, product) => {
        const scene = total[product.groupId] || [];

        total[product.groupId] = [...scene, product.id];
        return total;
      }, {});

      const scenes: {[id: string]: string[]} = {};
      for (const [groupId, productNames] of Object.entries(productGroups)) {

        (<string[]>productNames).sort(
          (a, b) => products[a].bytes - products[b].bytes
        ).reverse();

        scenes[groupId] = Array.from(new Set(productNames)) ;
      }

      let selected = products[state.selected] ? products[state.selected].id : null;

      if (action.payload.searchType === SearchType.BASELINE) {
        Object.values(products).forEach((product: CMRProduct) => {
          if (product.metadata.temporal === 0 && product.metadata.perpendicular === 0) {
            selected = product.id;
          }
        });
      }

      if (selected === null) {
        const sceneList = allScenesFrom(scenes, products);
        const firstScene = sceneList[0];

        if (firstScene) {
          selected = firstScene.id;
        }
      }

      return {
        ...state,

        ids: Object.keys(products),
        selected,

        areResultsLoaded: true,
        products,
        scenes,
        productUnzipLoading: null,
        openUnzippedProduct: null
      };
    }

    case ScenesActionType.SET_SELECTED_SCENE: {
      return {
        ...state,
        selected: action.payload,
        productUnzipLoading: null,
        openUnzippedProduct: null
      };
    }

    case ScenesActionType.SELECT_NEXT_SCENE: {
      const scenes = allScenesFrom(state.scenes, state.products);
      const scene = state.products[state.selected] || null;

      return selectNext(state, scenes, scene);
    }

    case ScenesActionType.SELECT_PREVIOUS_SCENE: {
      const scenes = allScenesFrom(state.scenes, state.products);
      const scene = state.products[state.selected] || null;

      return selectPrevious(state, scenes, scene);
    }

    case ScenesActionType.SET_SELECTED_PAIR: {
      return {
        ...state,
        selectedPair: action.payload,
        productUnzipLoading: null,
        openUnzippedProduct: null
      };
    }

    case ScenesActionType.SELECT_NEXT_WITH_BROWSE: {
      const scenes = allScenesWithBrowse(state.scenes, state.products);
      const scene = state.products[state.selected] || null;

      return selectNext(state, scenes, scene);
    }

    case ScenesActionType.SELECT_PREVIOUS_WITH_BROWSE: {
      const scenes = allScenesWithBrowse(state.scenes, state.products);
      const scene = state.products[state.selected] || null;

      return selectPrevious(state, scenes, scene);
    }


    case ScenesActionType.SET_RESULTS_LOADED: {
      return {
        ...state,
        areResultsLoaded: action.payload,
      };
    }

    case ScenesActionType.SET_MASTER: {
      const newMaster = Object.values(state.products)
        .filter(product => product.name === action.payload)[0];

      return {
        ...state,
        master: action.payload,
        masterOffsets: {
          temporal: -newMaster.metadata.temporal,
          perpendicular: -newMaster.metadata.perpendicular
        }
      };
    }

    case ScenesActionType.SET_FILTER_MASTER: {
      return {
        ...state,
        filterMaster: action.payload,
        master: action.payload
      };
    }

    case ScenesActionType.CLEAR_BASELINE: {
      return {
        ...state,
        filterMaster: null,
        master: null,
        masterOffsets: {
          temporal: 0,
          perpendicular: 0
        }
      };
    }

    case ScenesActionType.OPEN_UNZIPPED_PRODUCT: {
      return {
        ...state,
        openUnzippedProduct: action.payload.id
      };
    }

    case ScenesActionType.LOAD_UNZIPPED_PRODUCT: {
      return {
        ...state,
        productUnzipLoading: action.payload.id,
        openUnzippedProduct: action.payload.id
      };
    }

    case ScenesActionType.ADD_UNZIPPED_PRODUCT: {
      const unzipped = { ...state.unzipped };
      const product = action.payload.product;

      unzipped[product.id] = action.payload.unzipped;

      return {
        ...state,
        unzipped,
        productUnzipLoading: null,
      };
    }

    case ScenesActionType.SET_PERPENDICULAR_SORT_DIRECTION: {
      return {
        ...state,
        perpendicularSort: action.payload
      };
    }

    case ScenesActionType.SET_TEMPORAL_SORT_DIRECTION: {
      return {
        ...state,
        temporalSort: action.payload
      };
    }

    case ScenesActionType.ERROR_LOADING_UNZIPPED: {
      return {
        ...state,
        productUnzipLoading: null,
        openUnzippedProduct: null
      };
    }

    case ScenesActionType.CLOSE_ZIP_CONTENTS: {
      return {
        ...state,
        openUnzippedProduct: null
      };
    }

    case ScenesActionType.CLEAR_UNZIPPED_PRODUCTS: {
      return {
        ...state,
        unzipped: {},
        productUnzipLoading: null,
      };
    }

    case ScenesActionType.ADD_CUSTOM_PAIR: {
      return {
        ...state,
        customPairs: [...state.customPairs, action.payload]
      };
    }

    case ScenesActionType.CLEAR_CUSTOM_PAIRS: {
      return {
        ...state,
        customPairs: []
      };
    }

    case ScenesActionType.CLEAR: {
      return initState;
    }

    default: {
      return state;
    }
  }
}

const selectNext = (state, scenes, scene) => {
  if (!scenes[0]) {
    return {
      ...state
    };
  }

  if (!scene) {
    const firstScene = scenes[0];

    return {
      ...state,
      selected: firstScene.id
    };
  }

  const currentSelected = scenes
    .filter(g => g.name === scene.name)
    .pop();

  const nextIdx = Math.min(
    scenes.indexOf(currentSelected) + 1,
    scenes.length - 1
  );

  const nextScene = scenes[nextIdx];

  return {
    ...state,
    selected: nextScene.id,
    openUnzippedProduct: null,
    productUnzipLoading: null,
  };
};

const selectPrevious = (state, scenes, scene) => {
  if (!scenes[0]) {
    return {
      ...state
    };
  }

  if (!scene) {
    const lastScene = scenes[scenes.length - 1];

    return {
      ...state,
      selected: lastScene.id
    };
  }

  const currentSelected = scenes
    .filter(g => g.name === scene.name)
    .pop();

  const previousIdx = Math.max(scenes.indexOf(currentSelected) - 1, 0);
  const previousScene = scenes[previousIdx];

  return {
    ...state,
    selected: previousScene.id,
    openUnzippedProduct: null,
    productUnzipLoading: null,
  };
};


export const getScenesState = createFeatureSelector<ScenesState>('scenes');

export const allScenesFrom = (scenes: {[id: string]: string[]}, products) => {
  return Object.values(scenes)
    .map(group => {

      const browse = group
        .map(name => products[name])
        .filter(product => !product.browses[0].includes('no-browse.png'))
        .pop();

      return browse ? browse : products[group[0]];
    });
};

export const allScenesWithBrowse = (scenes: {[id: string]: string[]}, products) => {
  const withBrowses = allScenesFrom(scenes, products).filter(
    scene => scene.browses.filter(browse => !browse.includes('no-browse')).length > 0
  );

  return withBrowses;
};

export const getScenes = createSelector(
  getScenesState,
  (state: ScenesState) => allScenesFrom(state.scenes, state.products)
);

export const getScenesWithBrowse = createSelector(
  getScenesState,
  (state: ScenesState) => allScenesWithBrowse(state.scenes, state.products)
);

export const getAreResultsLoaded = createSelector(
  getScenesState,
  (state: ScenesState) => state.areResultsLoaded
);

export const getNumberOfScenes = createSelector(
  getScenes,
  (scenes: CMRProduct[]) => scenes.length
);

export const getSelectedSceneProducts = createSelector(
  getScenesState,
  (state: ScenesState) => {
    const selected = state.products[state.selected];

    return productsForScene(selected, state);
  }
);

export const getSceneProducts = createSelector(
  getScenesState,
  (state: ScenesState, props: {sceneId: string}) => {
    const selected = state.products[props.sceneId];

    return productsForScene(selected, state);
  }
);

export const getSelectedSceneBrowses = createSelector(
  getScenesState,
  (state: ScenesState) => {
    const selected = state.products[state.selected];

    if (!selected) {
      return;
    }

    let browses = [];

    productsForScene(selected, state).forEach(
      product => browses = [...browses, ...product.browses]
    );

    const unique = Array.from(new Set(
      browses
    ));

    return unique.length > 1 ?
      unique.filter(b => !b.includes('no-browse')) :
      unique;
  }
);

const productsForScene = (selected, state) => {
  if (!selected) {
    return;
  }

  const products = state.scenes[selected.groupId] || [];

  return products
    .map(id => state.products[id])
    .sort(function(a, b) {
      return a.bytes - b.bytes;
    }).reverse();
};


export const getAreProductsLoaded = createSelector(
  getScenes,
  state => state.length > 0
);

export const getProducts = createSelector(
  getScenesState,
  state => state.products
);

export const getAllProducts = createSelector(
  getScenesState,
  state => Object.values(state.products)
);

export const getNumberOfProducts = createSelector(
  getAllProducts,
  products => products.length
);

export const getAllSceneProducts = createSelector(
  getScenesState,
  (state: ScenesState) => {
    const allSceneProducts = {};

    Object.entries(state.scenes).forEach(
      ([sceneId, scene]) => {
        const products = scene
          .map(name => state.products[name]);

        allSceneProducts[sceneId] = products;
      }
    );

    return allSceneProducts;
  }
);

export const getSelectedScene = createSelector(
  getScenesState,
  (state: ScenesState) => state.products[state.selected] || null
);

export const getUnzipLoading = createSelector(
  getScenesState,
  (state: ScenesState) => state.productUnzipLoading
);

export const getUnzippedProducts = createSelector(
  getScenesState,
  (state: ScenesState) => state.unzipped
);

export const getOpenUnzippedProduct = createSelector(
  getScenesState,
  (state: ScenesState) => state.products[state.openUnzippedProduct] || null
);

export const getShowUnzippedProduct = createSelector(
  getScenesState,
  (state: ScenesState) => state.openUnzippedProduct && !state.productUnzipLoading
);

export const getMasterName = createSelector(
  getScenesState,
  state => state.master
);

export const getFilterMaster = createSelector(
  getScenesState,
  state => state.filterMaster
);

export const getMasterOffsets = createSelector(
  getScenesState,
  state => state.masterOffsets
);

export const getTemporalExtrema = createSelector(
  getScenesState,
  state => extrema(
    state.products,
    product => product.metadata.temporal
  )
);

export const getPerpendicularExtrema = createSelector(
  getScenesState,
  state => extrema(
    state.products,
    product => product.metadata.perpendicular
  )
);

const extrema = (prods, keyFunc) => {
  const products = Object.values(prods);
  const nullRange = {min: null, max: null};

  if (products.length === 0) {
    return nullRange;
  }

  const vals: number[] = products.map(keyFunc);

  const range = {
    min: Math.min(...vals),
    max: Math.max(...vals)
  };

  return (range.min === range.max) ? nullRange : range;
};

export const getPerpendicularSortDirection = createSelector(
  getScenesState,
  state => state.perpendicularSort
);

export const getTemporalSortDirection = createSelector(
  getScenesState,
  state => state.temporalSort
);

export const getCustomPairs = createSelector(
  getScenesState,
  state => state.customPairs
);

export const getSelectedPairIds = createSelector(
  getScenesState,
  state => state.selectedPair
);

export const getSelectedPair = createSelector(
  getScenesState,
  state => {
    const selected = state.selectedPair;
    if (selected === null) {
      return selected;
    } else {
      return [
        state.products[selected[0]],
        state.products[selected[1]]
      ];
    }
  }
);
