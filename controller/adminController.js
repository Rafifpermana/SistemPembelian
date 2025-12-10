const db = require("../config/database");

exports.viewDashboard = (req, res) => {
  const queryProducts =
    "SELECT p.id, p.name, p.price, s.quantity FROM products p JOIN stocks s ON p.id = s.product_id";
  const queryTransactions = `
        SELECT t.*, p.name 
        FROM transactions t 
        JOIN products p ON t.product_id = p.id 
        ORDER BY t.created_at DESC`;

  db.query(queryProducts, (err, products) => {
    if (err) throw err;
    db.query(queryTransactions, (err, transactions) => {
      if (err) throw err;
      res.render("index", { products, transactions });
    });
  });
};

exports.processBuy = (req, res) => {
  const { product_id, quantity } = req.body;
  const jumlahBeli = parseInt(quantity);

  db.beginTransaction((err) => {
    if (err) throw err;
    const queryCheck = `
            SELECT p.name, p.price, s.quantity 
            FROM products p 
            JOIN stocks s ON p.id = s.product_id 
            WHERE p.id = ? 
            FOR UPDATE
        `;

    db.query(queryCheck, [product_id], (err, results) => {
      if (err) {
        return db.rollback(() => {
          throw err;
        });
      }

      if (results.length === 0) {
        return db.rollback(() => {
          res.send(
            "<script>alert('Produk tidak ditemukan!'); window.location.href='/';</script>"
          );
        });
      }

      const product = results[0];
      const currentStock = product.quantity;
      const price = product.price;

      if (jumlahBeli > currentStock) {
        return db.rollback(() => {
          const pesan = `GAGAL! Stok ${product.name} berubah/tidak cukup. Sisa stok valid di database: ${currentStock}. Permintaan kamu: ${jumlahBeli}`;
          res.send(`
                        <script>
                            alert('${pesan}');
                            window.location.href = '/';
                        </script>
                    `);
        });
      }

      const total_price = price * jumlahBeli;

      db.query(
        "INSERT INTO transactions (product_id, quantity, total_price) VALUES (?, ?, ?)",
        [product_id, jumlahBeli, total_price],
        (err) => {
          if (err) {
            return db.rollback(() => {
              throw err;
            });
          }

          db.query(
            "UPDATE stocks SET quantity = quantity - ? WHERE product_id = ?",
            [jumlahBeli, product_id],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  throw err;
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    throw err;
                  });
                }
                res.redirect("/");
              });
            }
          );
        }
      );
    });
  });
};

exports.processCancel = (req, res) => {
  const transId = req.params.id;

  db.query(
    "SELECT * FROM transactions WHERE id = ? AND status = 'completed'",
    [transId],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const trans = results[0];
        db.query(
          "UPDATE transactions SET status = 'cancelled' WHERE id = ?",
          [transId],
          (err) => {
            if (err) throw err;

            db.query(
              "UPDATE stocks SET quantity = quantity + ? WHERE product_id = ?",
              [trans.quantity, trans.product_id],
              (err) => {
                if (err) throw err;
                res.redirect("/");
              }
            );
          }
        );
      } else {
        res.redirect("/");
      }
    }
  );
};
