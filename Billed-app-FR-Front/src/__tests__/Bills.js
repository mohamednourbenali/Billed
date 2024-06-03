/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI, {rows} from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills,{constructor} from '../containers/Bills.js'
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore);
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe ("Testing rows function", () => {
    test ("if data is undefined then it should return empty string", ()=>{
      const result = rows(undefined);
      expect(result).toBe('');
    });
    test("if data is an empty array it should return an empty string", ()=>{
      const result = rows([]);
      expect(result).toBe('');
    });
    test("for a non-empty data array it should return a HTML rows sorted by date", ()=>{
      const data = [
        {id : 1, date : '2024-01-01'},
        {id : 2, date : '2024-02-01'},
        {id : 3, date : '2024-03-01'}
      ];
      const result = rows(data);
      expect(result.indexOf('2024-03-01')).toBeLessThan(result.indexOf('2024-02-01'));
    }) 
  })
});
describe("testing Bills statements", ()=>{
  test('should initialize document, onNAvigate, store, and localStorage correctly',()=>{
    const component = new constructor({
      document: 'testDocument',
      onNavigate: () =>{},
      store: 'testStore',
      localStorage: 'testLocalStorage'
    });
    // Vérifie l'initialisation de this.document
    expect(component.document).toBeDefined();
    expect(component.document).toBe('testDocument');
    // Vérifier l'initialisation de onNavigate
    expect(component.onNavigate).toBeDefined();
    expect(typeof component.onNavigate).toBe('function')
    // Vérifier l'initiation de this.store
    expect(component.store).toBeDefined();
    expect(component.store).toBe('testStore');
    // Vérifier l'initiation de localStorage
    expect(component.localStorage).toBeDefined();
    expect(component.localStorage).toBe('testLocalStorage');
  });
  test("the button should be clickable",()=>{
    // mocking the function
    const onNavigate = jest.fn();
    const store = {};
    const localStorage = {};

    // creating an instance of Bills 
    const bills = new Bills({
      document : document,
      onNavigate : onNavigate,
      store : store,
      localStorage : localStorage
    });
    // simulating a click on the button
    const button = document.createElement('button');
    button.setAttribute('data-testid', 'btn-new-bill');
    button.click();
    // verifying that the button is clickable
    expect(button.onclick).toBeDefined();
  });
  test('should display the modal when icon eye is clicked', () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = BillsUI({ data: bills });
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

			const modale = document.getElementById("modaleFile");
			$.fn.modal = jest.fn(() => modale.classList.add("show"));

			const eye = screen.getAllByTestId("icon-eye")[0];
			const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));

			eye.addEventListener("click", handleClickIconEye);
			userEvent.click(eye);
			expect(handleClickIconEye).toHaveBeenCalled();

			expect(modale.classList).toContain("show");
      expect(screen.getByText("Justificatif")).toBeTruthy();
      expect(bills[0].fileUrl).toBeTruthy();
  });    
})
describe('Testing getBills method', () => {
  test('should return formatted bills when store is defined', async () => {
    // Mocking the store object and its methods
    const billsData = [
      { id: 1, date: '2024-04-20', status: 'pending' },
      { id: 2, date: '2024-04-21', status: 'accepted' }
    ];
    const mockStore = {
      bills: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue(billsData)
      })
    };

    // Creating an instance of Bills with the mock store
    const bills = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: {}
    });

    // Calling the getBills method
    const formattedBills = await bills.getBills();

    // Formatting bills data
    const expectedFormattedBills = billsData.map(bill => ({
      ...bill,
      date: formatDate(bill.date),
      status: formatStatus(bill.status)
    }));

    // Verifying if the formatted bills are returned correctly
    expect(formattedBills).toEqual(expectedFormattedBills);
  });
});


// test d'intégration GET

describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to Bills page", () => {
		test("Then, fetches bills from mock API GET", async () => {
			window.onNavigate(ROUTES_PATH.Bills);
			expect(screen.getAllByText("Billed")).toBeTruthy();
			expect(await waitFor(() => screen.getByText("Mes notes de frais"))).toBeTruthy();
			expect(screen.getByTestId("tbody")).toBeTruthy();
			expect(screen.getAllByText("test1")).toBeTruthy();
		});
	});
  describe("when an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window,'localStorage',{value: localStorageMock});
      window.localStorage.setItem('uset', JSON.stringify({
        type: "Employee",
        email: "e@e"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    });
    test("Then, fetches messages from an API and fails with 500 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 500"));
					},
				};
			});
			window.onNavigate(ROUTES_PATH.Bills);
			await new Promise(process.nextTick);
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
  });
});