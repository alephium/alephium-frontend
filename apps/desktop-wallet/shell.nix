with import <nixpkgs> {};
let
  alephium-wallet = pkgs.callPackage ./alephium-wallet.nix {};
in
pkgs.mkShell {
  name = "alephium-desktop-wallet";
  buildInputs = [ alephium-wallet ];
}
