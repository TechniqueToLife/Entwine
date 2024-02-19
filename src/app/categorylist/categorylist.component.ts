import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LoginService } from '../service/login.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import * as firebase from 'firebase/compat';
import { Category } from '../model/category';
import { Extensions } from '../helpers/extensions';
import { UserConnect } from '../service/userconnect';
import { Globals } from '../helpers/globals';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-categorylist',
  templateUrl: './categorylist.component.html',
  styleUrls: ['./categorylist.component.css']
})
export class CategorylistComponent implements OnInit {



      databaseRef : AngularFirestore;

      categories : Category[] = [];

      displayedColumns = [ 'categoryId', 'categoryName', 'category', 'uniqueUrl', 'archived'];

      topLevel = false;
      active = false;

      params : string[] = [];

      inputWidth = 500;
      searchNameParam? : string;
      autocompletecategories : Category[] = [];
      selectedCategory? : Category;


      @ViewChild(MatTable) matTable?: MatTable<any>;


    constructor(db: AngularFirestore,
      private router: Router,
      private route : ActivatedRoute,
      public loginData : LoginService, private extensions : Extensions, private userConnect : UserConnect, private globals : Globals, private _snackBar: MatSnackBar) {
        this.databaseRef = db;
        this.loginData.updateInAdmin(true);
    }

    ngOnInit(): void {

    }


    ngAfterViewInit(): void {
      this.searchCategory();
    }

    searchCategory() {
      this.userConnect.fetchCategories(20, this.params, undefined, undefined, this.searchNameParam, this.topLevel ? undefined : "").then(categories => {
        this.categories = categories;
        this.matTable?.renderRows();
      });
    }

    ngOnDestroy(): void {
      this.loginData.updateInAdmin(false);
    }

    loadPreviouscategories() {
      this.userConnect.fetchCategories(20, this.params, undefined, this.categories[0], this.searchNameParam, this.topLevel ? undefined : "").then(categories => {
        this.categories = categories;
        this.matTable?.renderRows();
      })
    }

    loadNextcategories() {
      this.userConnect.fetchCategories(20, this.params,  this.categories[this.categories.length - 1],  undefined,  this.searchNameParam, this.topLevel ? undefined : "").then(categories => {
        this.categories = categories;
        this.matTable?.renderRows();
      })
    }

    searchCategoriesAutocomplete() {
      this.userConnect.fetchCategories(20, undefined, undefined, undefined, this.searchNameParam, this.topLevel ? undefined : "").then(categories => {
        this.autocompletecategories = categories;
      });
    }

    selectCategory(input : Category) {
      console.log(input);
      // this.categoryId = input.id;
      this.selectedCategory = input;
      this.router.navigate(["/categoriesettings/"+this.selectedCategory.id] , { skipLocationChange: false });
    }


    search() {
      this.userConnect.fetchCategories(20, this.params, undefined, undefined, this.searchNameParam, this.topLevel ? undefined : "").then(categories => {
        this.categories = categories;
        this.matTable?.renderRows();
      });
    }

    toggleTopLevel() {
      console.log("toggleTopLevel");
      this.search();
    }

    toggleActiveReq() {
      console.log("toggleActiveReq");
      this.search();
    }


}
