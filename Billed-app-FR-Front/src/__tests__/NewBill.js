/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then email icon in vetical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      //to-do write assertion
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    })
    test("Then, all the form input should be render correctly", () => {
			document.body.innerHTML = NewBillUI();

			const formNewBill = screen.getByTestId("form-new-bill");
			const type = screen.getAllByTestId("expense-type");
			const name = screen.getAllByTestId("expense-name");
			const date = screen.getAllByTestId("datepicker");
			const amount = screen.getAllByTestId("amount");
			const vat = screen.getAllByTestId("vat");
			const pct = screen.getAllByTestId("pct");
			const commentary = screen.getAllByTestId("commentary");
			const file = screen.getAllByTestId("file");
			const submitBtn = document.querySelector("#btn-send-bill");

			expect(formNewBill).toBeTruthy();
			expect(type).toBeTruthy();
			expect(name).toBeTruthy();
			expect(date).toBeTruthy();
			expect(amount).toBeTruthy();
			expect(vat).toBeTruthy();
			expect(pct).toBeTruthy();
			expect(commentary).toBeTruthy();
			expect(file).toBeTruthy();
			expect(submitBtn).toBeTruthy();

			expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
		});
  });
});

describe("Given I am connected as an employee and i am on newBill page", () =>{
  describe("when i try to upload a file", () => {
    test("then the file extension should be JPG|JPEG|PNG", () =>{
      window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES ({ pathname });
      };
      const store = null;
			const newBill = new NewBill({
				document,
				onNavigate,
				store,
				localStorage,
			});
			const handleChangeFile = jest.spyOn(newBill, "handleChangeFile")
			const file = screen.getByTestId("file");
      const isFileImage = jest.spyOn(newBill, "isFileImage");

			file.addEventListener("change", handleChangeFile);
			fireEvent.change(file, {
				target: {
					files: [new File(["file.png"], "file.png", { type: "image/png" })],
				},
			});
      const fileExtension = "png"
      expect(handleChangeFile).toHaveBeenCalled();
      expect(isFileImage).toHaveBeenCalled();
      expect(newBill.isFileImage(fileExtension)).toBe(true);
    });
    test("then an alert error should be displayed if the file is not an image", () => {
      window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES ({ pathname });
      };
      const store = null;
			const newBill = new NewBill({
				document,
				onNavigate,
				store,
				localStorage,
			});
			const handleChangeFile = jest.spyOn(newBill, "handleChangeFile")
			const file = screen.getByTestId("file");
      const isFileImage = jest.spyOn(newBill, "isFileImage");

			window.alert = jest.spyOn(window, 'alert').mockImplementation(()=>{})
			file.addEventListener("change", handleChangeFile);
			fireEvent.change(file, {
				target: {
					files: [new File(["file.pdf"], "file.pdf", { type: "pdf" })],
				},
			});
      expect(window.alert).toHaveBeenCalledWith("you should select an image");
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill page and I submit the form with valid data", () => {
    test("Then, handleSubmit function should be called and the bill should be created", () => {
      window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES ({ pathname });
      };
      const store = null;
			const newBill = new NewBill({
				document,
				onNavigate,
				store,
				localStorage,
			});
      const updateBill = jest.spyOn(newBill, "updateBill");

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-05-23" } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "10" } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } })

      newBill.fileUrl = "https://example.com/file.jpg"
      newBill.fileName = "file.jpg"

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.spyOn(newBill, "handleSubmit");

      form.addEventListener("submit",handleSubmit);
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled();

      const expectedBill = {
        type: "Transports",
        name: "Train ticket",
        amount: 100,
        date: "2024-05-23",
        vat: "20",
        pct: 10,
        commentary: "Business trip",
        fileUrl: "https://example.com/file.jpg",
        fileName: "file.jpg",
        status: 'pending'
      }

      expect(updateBill).toHaveBeenCalledWith(expectedBill);
    });
  });
});

// test d'integration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill Page and submit a new bill", () => {
    let onNavigate;

    beforeEach(() => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee",}));
      document.body.innerHTML = NewBillUI();
      onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      
    });

    test("submits a new bill and succeeds with mock API POST", async () => {
      // Create an instance of NewBill
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Mock the updateBill method
      const updateBill = jest.spyOn(newBill, "updateBill");

      // Fill in the form fields
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-05-23" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "10" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });

      // Mock file URL and file name
      newBill.fileUrl = "https://example.com/file.jpg";
      newBill.fileName = "file.jpg";

      // Simulate form submission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Expected bill object
      const expectedBill = {
        type: "Transports",
        name: "Train ticket",
        amount: 100,
        date: "2024-05-23",
        vat: "20",
        pct: 10,
        commentary: "Business trip",
        fileUrl: "https://example.com/file.jpg",
        fileName: "file.jpg",
        status: 'pending'
      };

      // Assertions
      await waitFor(() => expect(updateBill).toHaveBeenCalledWith(expectedBill));
    });
  });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "e@e"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      });

      test("submits a new bill and fails with 404 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
				};

				const newBill = new NewBill({ document, onNavigate, store, localStorage });
				newBill.isFileImage = true;

				// Submit form
				const form = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
				form.addEventListener("submit", handleSubmit);

				fireEvent.submit(form);
				await new Promise(process.nextTick);
				expect(postSpy).toBeCalledWith(new Error("Erreur 404"));
      });
    });    
  });
  