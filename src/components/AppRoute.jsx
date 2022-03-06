import React, { Suspense } from 'react';
import { RouteProps, Route } from 'react-router-dom';

const AppRoute = () => {
    const RouteComponent = routeComponent;
  
    return (
      <RouteComponent
        {...rest}
        render={(props) => {
          return (
            <Suspense fallback={null}>
                {/* 
                // @ts-ignore (bad type def) */}
                <Component {...props} />
            </Suspense>
          );
        }}
      />
    );
};
  
export default AppRoute;
  