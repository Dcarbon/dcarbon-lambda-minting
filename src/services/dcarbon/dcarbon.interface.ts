class IotProject {
  id: string;

  owner: string;

  locationName: string;

  location: {
    latitude: number;
    longitude: number;
  };

  status: number;

  ca: string;

  ua: string;

  images: [string];

  specs: {
    id: string;
    specs: {
      additionalProp1: number;
      additionalProp2: number;
      additionalProp3: number;
    };
  };

  descs: [
    {
      id: string;
      language: string;
      name: string;
      desc: string;
    },
  ];

  area: number;

  address: string;

  type: number;

  unit: number;

  country: {
    id: string;
    name: string;
    countryCode: string;
  };

  thumbnail: string;

  iframe?: string;
}

class IotDevice {
  id: string;

  project: string;

  address: string;

  type: number;

  status: number;

  position: {
    latitude: number;
    longitude: number;
  };

  owner: string;

  location: string;

  histories: [
    {
      iotId: string;
      projectId: string;
      isActivated: boolean;
      updatedAt: string;
      createdAt: string;
    },
  ];
}

class IotCommonResponse<T> {
  total?: string;

  data: T;
}

class IotSign {
  id: string;

  iotId: string;

  nonce: string;

  amount: string;

  signed: string;

  createdAt: string;

  updatedAt: string;

  iot: string;
}

export { IotProject, IotCommonResponse, IotDevice, IotSign };
