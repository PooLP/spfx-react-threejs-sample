// React
import * as React from 'react';

// React Context
import { AppContext, } from './AppContext';

// Component
import { Slider } from './Slider/Slider';

// Interface
import { IRootComponentProps } from './IRootComponentProps';

/**
 *   This component manages state
 */
export const RootComponent: React.FunctionComponent<IRootComponentProps> = (props) => {

  return (
    <AppContext.Provider
      value={
        {
          context: props.context,
          theme: props.theme
        }
      }>
      <Slider />
    </AppContext.Provider>
  );
};

