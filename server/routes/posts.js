const express = require('express');
const router = express.Router();
const { postsDb, usersDb } = require('../db');

// POST: Creează o postare nouă
router.post('/create', async (req, res) => {
  try {
    const { userId, image, caption } = req.body;

    if (!userId || !image) {
      return res.status(400).json({ message: 'Lipsesc date (imagine sau user)' });
    }

    const user = await usersDb.findOne({ _id: userId });
    const authorName = user ? user.email.split('@')[0] : 'Anonim';

    const newPost = {
      userId,
      author: authorName,
      image,
      caption,
      likes: [], // <--- SCHIMBARE: Acum e o listă (array), nu un număr
      createdAt: new Date().toISOString()
    };

    const post = await postsDb.insert(newPost);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la crearea postării' });
  }
});

// GET: Ia toate postările
router.get('/all', async (req, res) => {
  try {
    const posts = await postsDb.find({}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la preluarea postărilor' });
  }
});

// PUT: Dă Like / Scoate Like (Toggle) - RUTA NOUĂ
router.put('/like/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;

    const post = await postsDb.findOne({ _id: postId });
    if (!post) return res.status(404).json({ message: 'Postare negăsită' });

    // Verificăm dacă userul a dat deja like
    // Asigurăm compatibilitatea cu postările vechi care aveau likes: 0
    let likesArr = Array.isArray(post.likes) ? post.likes : [];

    const index = likesArr.indexOf(userId);

    if (index === -1) {
      // Nu a dat like -> Adăugăm ID-ul (LIKE)
      likesArr.push(userId);
    } else {
      // A dat deja like -> Scoatem ID-ul (UNLIKE)
      likesArr.splice(index, 1);
    }

    // Actualizăm baza de date
    await postsDb.update({ _id: postId }, { $set: { likes: likesArr } });
    
    // Trimitem lista nouă de like-uri înapoi la frontend
    res.json({ likes: likesArr });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare la like' });
  }
});

module.exports = router;