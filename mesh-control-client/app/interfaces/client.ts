export interface SetupData {
    setupData: {
      bind?: {
        unicastAddress: { index: number; value: string };
        model: {
          index: number;
          value: string;
        };
        appKeyIndex: number;
        saved: boolean;
      };
      publish?: {
        unicastAddress: { index: number; value: string };
        model: {
          index: number;
          value: string;
        };
        address: {
          type: string;
          value: string;
        };
        publicationPeriod: {
          step: number;
          res: number;
        };
        retransmitionCount: {
          cnt: number;
          per: number;
        };
        appKeyIndex: number;
        saved: boolean;
      };
      subscribe?: {
        unicastAddress: { index: number; value: string };
        model: {
          index: number;
          value: string;
        };
        address: {
          type: string;
          value: string;
        };
        appKeyIndex: number;
        saved: boolean;
      };
      identity?: {
        saved: boolean;
        unicastAddress: { index: number; value: string };
        netKeyIndex: number;
        state: number;
      };
      beacon?: {
        saved: boolean;
        unicastAddress: { index: number; value: string };
        state: number;
      };
      heartbeat_publish?: {
        saved: boolean;
        unicastAddress: { index: number; value: string };
        address: {
          type: string;
          value: string;
        };
        relay: number;
        retransmitCount: {
          value: number;
          label: string;
        };
        periodLog: {
          value: number;
          label: string;
        };
        ttl: number;
        features: {
          relay: boolean;
          proxy: boolean;
          friend: boolean;
          lowPower: boolean;
        };
        netKeyIndex: number;
      };
      heartbeat_subscribe?: {
        saved: boolean;
        count: {
          value: number;
          label: string;
        };
        minHops: {
          value: number;
          label: string;
        };
        maxHops: {
          value: number;
          label: string;
        };
        unicastAddress: { index: number; value: string };
        address: {
          type: string;
          value: string;
        };
        periodLog: {
          value: number;
          label: string;
        };
      };
      relay?: {
        saved: boolean;
        unicastAddress: { index: number; value: string };
        count: number;
        step: number;
        relay: boolean;
      };
      proxy?: {
        saved: boolean;
        unicastAddress: { index: number; value: string };
        proxy: boolean;
      };
      ttl?: {
        saved: boolean;
        unicastAddress: { index: number; value: string };
        ttl: number;
      };
    };
  }