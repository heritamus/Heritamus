import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { LoginComponent } from '../../login/login.component';

export class ReuseStrategy implements RouteReuseStrategy {

  private routesToStore = ['graph'];
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  /**
   * Fires when navigating to NEW route
   * -> asks whether to store OLD route - if true => this.store
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (route.component === LoginComponent) {
      this.storedRoutes.clear();
      return false;
    }
    return this.routesToStore.includes(route.routeConfig.path);
  }

  /**
   * Fires if 'shouldDetach' returns true
   * -> stores OLD route before going to NEW one
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.storedRoutes.set(route.routeConfig.path, handle);
  }

  /**
   * Fires when navigating to NEW route
   * -> asks whether to retrieve NEW route - if true => this.retrieve
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRoutes.has(route.routeConfig.path);
  }

  /**
   * Fires if 'shouldAttach' returns true
   * -> retrieves NEW route after navigating from OLD route
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.storedRoutes.get(route.routeConfig.path);
  }

  /**
   * Fires when navigating to NEW route
   * -> asks whether to reuse the route if we're going to and from the same route
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

}
