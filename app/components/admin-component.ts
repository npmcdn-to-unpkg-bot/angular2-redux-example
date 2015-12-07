import {Component, CORE_DIRECTIVES} from 'angular2/angular2'

import {AppStore} from "../stores/app-store";
import {UserActions} from "../actions/user-actions";

import {UsersView} from "../views/admin/users-view";
import {UserView} from "../views/admin/user-view";

import { createSelector } from 'rackt/reselect/src/index.js';

@Component({
    selector: 'admin',
    template: `
        <h3>Users</h3>
        <a href="" (click)="toggleFilter($event)" [class.hidden]="filmFilter || !usersToShow">Turn filter on</a>
        <a href="" (click)="toggleFilter($event)" [class.hidden]="!filmFilter">Turn filter off</a>
        <users
            [data]="usersToShow"
            (current)="setCurrentUser($event)">
        </users>
        <hr/>
        <h3>Current User</h3>
        <br/>
        <user [data]="currentUser"></user>
    `,
    directives: [CORE_DIRECTIVES, UsersView, UserView]
})
export class AdminComponent {

    private usersToShow = null;
    private currentUser = null;
    private filmFilter = null;

    constructor(private _appStore:AppStore,
                private _userActions:UserActions) {

        const usersToShowSelector = AdminComponent.createUsersToShowSelector();

        _appStore.subscribe(() => {
            var state = _appStore.getState();
            this.usersToShow = usersToShowSelector(state);
            this.currentUser = state.users.current;
            this.filmFilter = state.users.filmFilter;

        });

        _appStore.dispatch(_userActions.fetchUsers());

    }

    private setCurrentUser(id) {
        this._appStore.dispatch(this._userActions.setCurrentUser(id))
    }

    private toggleFilter($event) {
        $event.preventDefault();
        this._appStore.dispatch(this._userActions.setFilmFilter(!this.filmFilter));
    }

    private static createUsersToShowSelector() {
        const currentFilmSelector = createSelector(
            state => state.users.filmFilter,
            state => state.films.currentFilm,
            (filmFilter, currentFilm) => filmFilter && currentFilm ? currentFilm : null
        );
        return createSelector(
            state => state.users.list,
            currentFilmSelector,
            (users, currentFilm) => currentFilm ? users.filter(AdminComponent.getFilter(currentFilm)) : users
        );
    };
    private static getFilter(film) {
        const ids = film.characters
            .map(url => AdminComponent.getId(url))
            .reduce((idsMap, id)=> {
                idsMap[id] = true;
                return idsMap;
            }, {});
        return user => ids[AdminComponent.getId(user.url)];
    };
    private static getId(url) {
        return url.replace(/[a-z\/\.\:]*/g, "");
    };

}