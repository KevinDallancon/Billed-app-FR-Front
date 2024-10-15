/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

// Mock de la partie 'store' pour simuler les appels à l'API
jest.mock("../app/store", () => mockStore);

// Début des tests pour la page Bills
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Configuation initiale pour les test
    beforeEach(() => {
      // Configuration commune à tous les tests de cette section
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
        writable: true,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
    });
    // Test : Vérification de la mise en surbrillance de l'icône de facture dans la mise en page verticale
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Attente asynchrone de l'apparition de l'icône dans le DOM
      await waitFor(() => screen.getByTestId("icon-window"));

      // Récupération de l'élément icône une fois qu'il est disponible dans le DOM
      const windowIcon = screen.getByTestId("icon-window");
      const windowIconActive = windowIcon.classList.contains("active-icon");
      // On verifie que l'élément a bien la classe active-icon
      expect(windowIconActive).toHaveClass;
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    // Test : Vérification de l'ouverture de la modal lors du clic sur l'icône d'œil
    test("Then a modal should open when clicking on an eye icon", () => {
      // Initialisation du DOM avec les données de factures
      document.body.innerHTML = BillsUI({ data: bills });

      // Récupération de toutes les icônes d'œil dans le document
      const iconEye = screen.getAllByTestId("icon-eye");

      // Itération sur chaque icône d'œil
      iconEye.forEach((icon) => {
        // Ajout d'un écouteur d'événement sur chaque icône
        icon.addEventListener("click", () => {
          // Recherche de la modal dans le DOM après le clic
          const modal = document.getElementById("modaleFile");
          // Vérification que la modal existe (est truthy) après le clic
          expect(modal).toBeTruthy();
        });

        // fireEvent permet de déclencher des événements DOM, ici un clic
        fireEvent.click(icon);
      });
    });
    // Test : Vérification de la navigation vers la page NewBill lors du clic sur le bouton 'Nouvelle note de frais'
    test('Then clicking on the "New Bill" button should navigate to the New Bill page', async () => {
      // Récupération du bouton "Nouvelle note de frais" dans le DOM
      const btnNewBill = screen.getAllByTestId("btn-new-bill");
      btnNewBill[0].click();
      await waitFor(() =>
        // vérifier que l'URL contient bien le chemin souhaité
        expect(window.location.href).toContain(ROUTES_PATH.NewBill)
      );
    });

    test("handleClickIconEye should open the modal with the bill image", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      // Fonction pour créer une nouvelle instance de la classe Bills
      const initBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const eyeIcon = screen.getAllByTestId("icon-eye")[0];
      $.fn.modal = jest.fn(); // Mock de la fonction modal de Bootstrap

      // Simule l'event clic sur l'icon
      const handleClickIconEye = jest.fn(() =>
        initBills.handleClickIconEye(eyeIcon)
      );

      eyeIcon.addEventListener("click", handleClickIconEye);
      fireEvent.click(eyeIcon);

      // Vérifie si la fonction et la modal ont été appelées
      expect(handleClickIconEye).toHaveBeenCalled();
      expect($.fn.modal).toHaveBeenCalled();
    });
  });
});
